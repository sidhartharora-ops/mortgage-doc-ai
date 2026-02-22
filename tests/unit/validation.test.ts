import { describe, it, expect } from "vitest";
import { ValidationAgent } from "@/lib/agents/validation-agent";

describe("ValidationAgent (deterministic)", () => {
  const agent = new ValidationAgent();

  it("passes validation for complete T4 fields", async () => {
    const result = await agent.run(
      {
        documentType: "t4",
        fields: [
          { fieldName: "box14_employment_income", value: "65000.00", confidence: 0.95 },
          { fieldName: "box22_income_tax_deducted", value: "12500.00", confidence: 0.93 },
          { fieldName: "tax_year", value: "2024", confidence: 0.99 },
          { fieldName: "employee_name", value: "Jane Smith", confidence: 0.96 },
        ],
      },
      { deterministic: true }
    );
    expect(result.status).toBe("success");
    const output = result.output as { valid: boolean };
    expect(output.valid).toBe(true);
  });

  it("fails when required fields are missing", async () => {
    const result = await agent.run(
      {
        documentType: "t4",
        fields: [
          { fieldName: "box14_employment_income", value: "65000.00", confidence: 0.95 },
        ],
      },
      { deterministic: true }
    );
    const output = result.output as { valid: boolean; issues: { rule: string }[] };
    // In deterministic mode, checks field count < 3
    expect(output.valid).toBe(false);
  });

  it("validates with rule engine in non-deterministic mode", async () => {
    // Use the real rule engine (no LLM calls needed)
    const result = await agent.run({
      documentType: "t4",
      fields: [
        { fieldName: "box14_employment_income", value: "65000.00", confidence: 0.95 },
        { fieldName: "box22_income_tax_deducted", value: "12500.00", confidence: 0.93 },
        { fieldName: "tax_year", value: "2024", confidence: 0.99 },
        { fieldName: "employee_name", value: "Jane Smith", confidence: 0.96 },
      ],
    });
    expect(result.status).toBe("success");
    const output = result.output as { valid: boolean; crossFieldScore: number };
    expect(output.valid).toBe(true);
    expect(output.crossFieldScore).toBeGreaterThan(0.8);
  });

  it("catches tax exceeding income", async () => {
    const result = await agent.run({
      documentType: "t4",
      fields: [
        { fieldName: "box14_employment_income", value: "10000.00", confidence: 0.95 },
        { fieldName: "box22_income_tax_deducted", value: "50000.00", confidence: 0.93 },
        { fieldName: "tax_year", value: "2024", confidence: 0.99 },
        { fieldName: "employee_name", value: "Jane Smith", confidence: 0.96 },
      ],
    });
    const output = result.output as { valid: boolean; issues: { rule: string; message: string }[] };
    expect(output.valid).toBe(false);
    expect(output.issues.some((i) => i.rule === "tax_less_than_income")).toBe(true);
  });

  it("passes validation for complete employment letter fields", async () => {
    const result = await agent.run({
      documentType: "employment_letter",
      fields: [
        { fieldName: "employee_name", value: "John Smith", confidence: 0.96 },
        { fieldName: "employer_name", value: "Maple Financial Corp.", confidence: 0.97 },
        { fieldName: "job_title", value: "Senior Software Engineer", confidence: 0.95 },
        { fieldName: "start_date", value: "2020-06-15", confidence: 0.93 },
        { fieldName: "annual_salary", value: "98500.00", confidence: 0.95 },
      ],
    });
    const output = result.output as { valid: boolean };
    expect(output.valid).toBe(true);
  });

  it("fails employment letter validation when employer is missing", async () => {
    const result = await agent.run({
      documentType: "employment_letter",
      fields: [
        { fieldName: "employee_name", value: "John Smith", confidence: 0.96 },
        // employer_name intentionally missing
        { fieldName: "job_title", value: "Engineer", confidence: 0.95 },
        { fieldName: "start_date", value: "2020-06-15", confidence: 0.93 },
        { fieldName: "annual_salary", value: "98500.00", confidence: 0.95 },
      ],
    });
    const output = result.output as { valid: boolean; issues: { rule: string; fields: string[] }[] };
    expect(output.valid).toBe(false);
    expect(output.issues.some((i) => i.fields.includes("employer_name"))).toBe(true);
  });

  it("catches gross pay less than net pay", async () => {
    const result = await agent.run({
      documentType: "paystub",
      fields: [
        { fieldName: "gross_pay", value: "2000.00", confidence: 0.95 },
        { fieldName: "net_pay", value: "5000.00", confidence: 0.93 },
        { fieldName: "employer_name", value: "Acme Corp", confidence: 0.96 },
        { fieldName: "employee_name", value: "Jane Smith", confidence: 0.96 },
      ],
    });
    const output = result.output as { valid: boolean; issues: { rule: string }[] };
    expect(output.valid).toBe(false);
    expect(output.issues.some((i) => i.rule === "gross_gte_net")).toBe(true);
  });
});
