import fs from "fs";
import path from "path";
import YAML from "yaml";

export type ValidationRule =
  | { type: "required"; name: string; fields: string[]; severity?: "error" | "warning" }
  | { type: "comparison"; name: string; left: string; right: string; operator: "gte" | "lte"; severity?: "error" | "warning" }
  | { type: "range"; name: string; field: string; min: number; max: number; severity?: "error" | "warning" };

// Default rules per document type (can be overridden by validation_rules.md/yaml)
const DEFAULT_RULES: Record<string, ValidationRule[]> = {
  t4: [
    { type: "required", name: "t4_required_fields", fields: ["box14_employment_income", "box22_income_tax_deducted", "tax_year", "employee_name"] },
    { type: "comparison", name: "tax_less_than_income", left: "box14_employment_income", right: "box22_income_tax_deducted", operator: "gte", severity: "error" },
    { type: "range", name: "reasonable_income", field: "box14_employment_income", min: 0, max: 5000000, severity: "warning" },
  ],
  noa: [
    { type: "required", name: "noa_required_fields", fields: ["total_income", "net_income", "taxable_income", "tax_year"] },
    { type: "comparison", name: "total_gte_net", left: "total_income", right: "net_income", operator: "gte", severity: "error" },
    { type: "comparison", name: "total_gte_taxable", left: "total_income", right: "taxable_income", operator: "gte", severity: "error" },
    { type: "comparison", name: "income_gte_tax", left: "total_income", right: "total_tax_payable", operator: "gte", severity: "error" },
  ],
  paystub: [
    { type: "required", name: "paystub_required_fields", fields: ["gross_pay", "net_pay", "employer_name", "employee_name"] },
    { type: "comparison", name: "gross_gte_net", left: "gross_pay", right: "net_pay", operator: "gte", severity: "error" },
    { type: "range", name: "reasonable_gross", field: "gross_pay", min: 0, max: 500000, severity: "warning" },
  ],
  bank_statement: [
    { type: "required", name: "bank_required_fields", fields: ["account_holder", "statement_period", "closing_balance"] },
    { type: "range", name: "reasonable_balance", field: "closing_balance", min: -100000, max: 50000000, severity: "warning" },
  ],
  employment_letter: [
    { type: "required", name: "employment_letter_required_fields", fields: ["employee_name", "employer_name", "job_title", "start_date", "annual_salary"] },
    { type: "range", name: "reasonable_salary", field: "annual_salary", min: 0, max: 5000000, severity: "warning" },
  ],
};

export function loadValidationRules(documentType: string): ValidationRule[] {
  // Try loading from external file first
  try {
    const rulesPath = path.join(process.cwd(), "specs", "validation_rules.yaml");
    if (fs.existsSync(rulesPath)) {
      const content = fs.readFileSync(rulesPath, "utf-8");
      const parsed = YAML.parse(content);
      if (parsed?.[documentType]) return parsed[documentType] as ValidationRule[];
    }
  } catch {
    // Fall back to defaults
  }
  return DEFAULT_RULES[documentType] || [];
}
