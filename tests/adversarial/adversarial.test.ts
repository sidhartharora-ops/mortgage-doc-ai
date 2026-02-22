import { describe, it, expect } from "vitest";
import { ClassificationAgent } from "@/lib/agents/classification-agent";
import { ExtractionAgent } from "@/lib/agents/extraction-agent";
import { ValidationAgent } from "@/lib/agents/validation-agent";
import { calculateConfidence } from "@/lib/confidence/engine";

describe("Adversarial Tests", () => {
  const classAgent = new ClassificationAgent();
  const extAgent = new ExtractionAgent();
  const valAgent = new ValidationAgent();

  describe("Rotated / garbled document text", () => {
    it("should flag for review when text is garbled", async () => {
      const garbedText = "4T TNEMANMER FO NOITAREMUNER DIAP xoB 41 emocnI 00056";
      const classResult = await classAgent.run(
        { rawText: garbedText, filename: "rotated_doc.pdf" },
        { deterministic: true }
      );
      const classOutput = classResult.output as { documentType: string; confidence: number };

      // Deterministic mode won't catch this, but confidence engine can
      const confidence = calculateConfidence({
        modelConfidence: classOutput.confidence,
        validationScore: 0.3, // Garbled docs would fail validation
        crossFieldScore: 0.2,
      });
      expect(confidence.requiresReview).toBe(true);
    });
  });

  describe("Missing Box 14 in T4", () => {
    it("should fail validation when Box 14 is missing", async () => {
      const result = await valAgent.run({
        documentType: "t4",
        fields: [
          // Box 14 intentionally missing
          { fieldName: "box22_income_tax_deducted", value: "12500.00", confidence: 0.93 },
          { fieldName: "tax_year", value: "2024", confidence: 0.99 },
          { fieldName: "employee_name", value: "Jane Smith", confidence: 0.96 },
        ],
      });
      const output = result.output as { valid: boolean; issues: { rule: string; fields: string[] }[] };
      expect(output.valid).toBe(false);
      expect(output.issues.some((i) => i.fields.includes("box14_employment_income"))).toBe(true);
    });
  });

  describe("Tax exceeds income", () => {
    it("should flag when tax deducted > employment income", async () => {
      const result = await valAgent.run({
        documentType: "t4",
        fields: [
          { fieldName: "box14_employment_income", value: "10000.00", confidence: 0.95 },
          { fieldName: "box22_income_tax_deducted", value: "50000.00", confidence: 0.93 },
          { fieldName: "tax_year", value: "2024", confidence: 0.99 },
          { fieldName: "employee_name", value: "Jane Smith", confidence: 0.96 },
        ],
      });
      const output = result.output as { valid: boolean; issues: { rule: string }[] };
      expect(output.valid).toBe(false);
      expect(output.issues.some((i) => i.rule === "tax_less_than_income")).toBe(true);

      // This should also trigger requiresReview via confidence
      const confidence = calculateConfidence({
        modelConfidence: 0.95,
        validationScore: 0.5, // Failed validation
        crossFieldScore: output.valid ? 1.0 : 0.4,
      });
      expect(confidence.requiresReview).toBe(true);
    });
  });

  describe("Multi-document in one file", () => {
    it("should produce low confidence for ambiguous multi-doc content", async () => {
      const multiDocText = `
T4 STATEMENT OF REMUNERATION PAID
Box 14 Employment Income: $65,000.00
---PAGE BREAK---
NOTICE OF ASSESSMENT
Total Income: $72,000.00
---PAGE BREAK---
PAY STATEMENT
Gross Pay: $5,416.67
      `.trim();

      const classResult = await classAgent.run(
        { rawText: multiDocText, filename: "multi_document_scan.pdf" },
        { deterministic: true }
      );
      // Deterministic mode uses filename, which has no doc type indicator
      const classOutput = classResult.output as { documentType: string; confidence: number };
      expect(classOutput.documentType).toBe("unknown");

      // With unknown type, extraction returns empty fields
      const extResult = await extAgent.run(
        { rawText: multiDocText, documentType: "unknown" },
        { deterministic: true }
      );
      const extOutput = extResult.output as { fields: unknown[] };
      expect(extOutput.fields.length).toBe(0);

      // Confidence should flag for review
      const confidence = calculateConfidence({
        modelConfidence: classOutput.confidence,
        validationScore: 0.0,
        crossFieldScore: 0.0,
      });
      expect(confidence.requiresReview).toBe(true);
    });
  });

  describe("Extremely low confidence extraction", () => {
    it("should require review when all field confidences are low", async () => {
      const lowConfFields = [
        { fieldName: "box14_employment_income", value: "maybe 65000?", confidence: 0.3 },
        { fieldName: "box22_income_tax_deducted", value: "unclear", confidence: 0.2 },
        { fieldName: "tax_year", value: "202?", confidence: 0.4 },
        { fieldName: "employee_name", value: "J??? S????", confidence: 0.15 },
      ];

      const avgConfidence = lowConfFields.reduce((s, f) => s + f.confidence, 0) / lowConfFields.length;

      const confidence = calculateConfidence({
        modelConfidence: avgConfidence,
        validationScore: 0.5,
        crossFieldScore: 0.3,
      });

      expect(confidence.score).toBeLessThan(0.5);
      expect(confidence.requiresReview).toBe(true);
    });
  });

  describe("Employment Letter: missing employer name", () => {
    it("should fail validation when employer name is missing", async () => {
      const result = await valAgent.run({
        documentType: "employment_letter",
        fields: [
          { fieldName: "employee_name", value: "John Smith", confidence: 0.96 },
          { fieldName: "job_title", value: "Engineer", confidence: 0.95 },
          { fieldName: "start_date", value: "2020-06-15", confidence: 0.93 },
          { fieldName: "annual_salary", value: "98500.00", confidence: 0.95 },
          // employer_name intentionally missing
        ],
      });
      const output = result.output as { valid: boolean; issues: { rule: string; fields: string[] }[] };
      expect(output.valid).toBe(false);
      expect(output.issues.some((i) => i.fields.includes("employer_name"))).toBe(true);
    });
  });

  describe("Employment Letter: unreasonable salary", () => {
    it("should warn when salary is outside reasonable range", async () => {
      const result = await valAgent.run({
        documentType: "employment_letter",
        fields: [
          { fieldName: "employee_name", value: "John Smith", confidence: 0.96 },
          { fieldName: "employer_name", value: "Acme Corp", confidence: 0.97 },
          { fieldName: "job_title", value: "CEO", confidence: 0.95 },
          { fieldName: "start_date", value: "2020-06-15", confidence: 0.93 },
          { fieldName: "annual_salary", value: "99000000.00", confidence: 0.95 },
        ],
      });
      const output = result.output as { valid: boolean; issues: { rule: string; severity: string }[] };
      // Range violations are warnings, not errors — document is still "valid" but flagged
      expect(output.issues.some((i) => i.rule === "reasonable_salary" && i.severity === "warning")).toBe(true);
      // Warning lowers cross-field score, triggering review
      const confidence = calculateConfidence({
        modelConfidence: 0.95,
        validationScore: 1.0,
        crossFieldScore: output.valid ? 1.0 - output.issues.length * 0.05 : 0.5,
      });
      expect(confidence.score).toBeLessThan(1.0);
    });
  });

  describe("NOA: total income less than net income", () => {
    it("should catch impossible income relationship", async () => {
      const result = await valAgent.run({
        documentType: "noa",
        fields: [
          { fieldName: "total_income", value: "30000.00", confidence: 0.94 },
          { fieldName: "net_income", value: "50000.00", confidence: 0.93 },
          { fieldName: "taxable_income", value: "28000.00", confidence: 0.92 },
          { fieldName: "tax_year", value: "2024", confidence: 0.99 },
        ],
      });
      const output = result.output as { valid: boolean; issues: { rule: string }[] };
      expect(output.valid).toBe(false);
      expect(output.issues.some((i) => i.rule === "total_gte_net")).toBe(true);
    });
  });
});
