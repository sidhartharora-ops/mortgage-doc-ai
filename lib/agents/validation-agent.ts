import { BaseAgent } from "./base-agent";
import { loadValidationRules, ValidationRule } from "@/lib/validation/rules";

interface ValidationInput {
  documentType: string;
  fields: { fieldName: string; value: string; confidence: number }[];
}

interface ValidationIssue {
  rule: string;
  severity: "error" | "warning";
  message: string;
  fields: string[];
}

interface ValidationOutput {
  valid: boolean;
  issues: ValidationIssue[];
  crossFieldScore: number;
}

export class ValidationAgent extends BaseAgent {
  name = "validation";
  version = "1.0.0";

  protected getFixtureOutput(input: unknown): ValidationOutput {
    const { fields } = input as ValidationInput;
    const hasAllFields = fields.length > 3;
    return {
      valid: hasAllFields,
      issues: hasAllFields
        ? []
        : [{ rule: "minimum_fields", severity: "warning", message: "Fewer fields than expected", fields: [] }],
      crossFieldScore: hasAllFields ? 0.95 : 0.6,
    };
  }

  protected async execute(input: unknown): Promise<{ output: ValidationOutput; confidence: number; model: string }> {
    const { documentType, fields } = input as ValidationInput;
    const rules = loadValidationRules(documentType);
    const issues: ValidationIssue[] = [];

    for (const rule of rules) {
      const issue = evaluateRule(rule, fields);
      if (issue) issues.push(issue);
    }

    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;
    const crossFieldScore = Math.max(0, 1.0 - errorCount * 0.2 - warningCount * 0.05);

    return {
      output: {
        valid: errorCount === 0,
        issues,
        crossFieldScore,
      },
      confidence: crossFieldScore,
      model: "rule-engine",
    };
  }
}

function evaluateRule(
  rule: ValidationRule,
  fields: { fieldName: string; value: string; confidence: number }[]
): ValidationIssue | null {
  const fieldMap = new Map(fields.map((f) => [f.fieldName, f.value]));

  switch (rule.type) {
    case "required": {
      const missing = rule.fields.filter((f) => !fieldMap.has(f));
      if (missing.length > 0) {
        return {
          rule: rule.name,
          severity: "error",
          message: `Missing required fields: ${missing.join(", ")}`,
          fields: missing,
        };
      }
      return null;
    }
    case "comparison": {
      const leftVal = parseFloat(fieldMap.get(rule.left) || "0");
      const rightVal = parseFloat(fieldMap.get(rule.right) || "0");
      if (rule.operator === "gte" && leftVal < rightVal) {
        return {
          rule: rule.name,
          severity: rule.severity || "error",
          message: `${rule.left} (${leftVal}) should be >= ${rule.right} (${rightVal})`,
          fields: [rule.left, rule.right],
        };
      }
      if (rule.operator === "lte" && leftVal > rightVal) {
        return {
          rule: rule.name,
          severity: rule.severity || "error",
          message: `${rule.left} (${leftVal}) should be <= ${rule.right} (${rightVal})`,
          fields: [rule.left, rule.right],
        };
      }
      return null;
    }
    case "range": {
      const val = parseFloat(fieldMap.get(rule.field) || "0");
      if (val < rule.min || val > rule.max) {
        return {
          rule: rule.name,
          severity: rule.severity || "warning",
          message: `${rule.field} value ${val} outside expected range [${rule.min}, ${rule.max}]`,
          fields: [rule.field],
        };
      }
      return null;
    }
    default:
      return null;
  }
}
