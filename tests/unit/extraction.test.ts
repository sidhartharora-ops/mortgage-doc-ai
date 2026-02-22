import { describe, it, expect } from "vitest";
import { ExtractionAgent } from "@/lib/agents/extraction-agent";

describe("ExtractionAgent (deterministic)", () => {
  const agent = new ExtractionAgent();

  it("extracts T4 fields with correct schema", async () => {
    const result = await agent.run(
      { rawText: "T4 content with Box 14", documentType: "t4" },
      { deterministic: true }
    );
    expect(result.status).toBe("success");
    const output = result.output as { documentType: string; fields: { fieldName: string; value: string; confidence: number }[] };
    expect(output.documentType).toBe("t4");
    expect(output.fields.length).toBeGreaterThan(0);

    // Validate schema of each field
    for (const field of output.fields) {
      expect(field).toHaveProperty("fieldName");
      expect(field).toHaveProperty("value");
      expect(field).toHaveProperty("confidence");
      expect(typeof field.fieldName).toBe("string");
      expect(typeof field.value).toBe("string");
      expect(field.confidence).toBeGreaterThanOrEqual(0);
      expect(field.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("extracts NOA fields", async () => {
    const result = await agent.run(
      { rawText: "NOA content", documentType: "noa" },
      { deterministic: true }
    );
    const output = result.output as { fields: { fieldName: string }[] };
    const fieldNames = output.fields.map((f) => f.fieldName);
    expect(fieldNames).toContain("total_income");
    expect(fieldNames).toContain("net_income");
    expect(fieldNames).toContain("taxable_income");
  });

  it("extracts paystub fields", async () => {
    const result = await agent.run(
      { rawText: "Paystub content", documentType: "paystub" },
      { deterministic: true }
    );
    const output = result.output as { fields: { fieldName: string }[] };
    const fieldNames = output.fields.map((f) => f.fieldName);
    expect(fieldNames).toContain("gross_pay");
    expect(fieldNames).toContain("net_pay");
  });

  it("extracts bank statement fields", async () => {
    const result = await agent.run(
      { rawText: "Bank statement content", documentType: "bank_statement" },
      { deterministic: true }
    );
    const output = result.output as { fields: { fieldName: string }[] };
    const fieldNames = output.fields.map((f) => f.fieldName);
    expect(fieldNames).toContain("closing_balance");
    expect(fieldNames).toContain("account_holder");
  });

  it("extracts employment letter fields", async () => {
    const result = await agent.run(
      { rawText: "Employment letter content", documentType: "employment_letter" },
      { deterministic: true }
    );
    const output = result.output as { fields: { fieldName: string }[] };
    const fieldNames = output.fields.map((f) => f.fieldName);
    expect(fieldNames).toContain("employee_name");
    expect(fieldNames).toContain("employer_name");
    expect(fieldNames).toContain("annual_salary");
    expect(fieldNames).toContain("job_title");
    expect(fieldNames).toContain("total_compensation");
  });

  it("returns empty fields for unknown document type", async () => {
    const result = await agent.run(
      { rawText: "Unknown content", documentType: "unknown" },
      { deterministic: true }
    );
    const output = result.output as { fields: unknown[] };
    expect(output.fields).toEqual([]);
  });

  it("all confidence values within threshold", async () => {
    const result = await agent.run(
      { rawText: "T4 content", documentType: "t4" },
      { deterministic: true }
    );
    const output = result.output as { fields: { confidence: number }[] };
    for (const field of output.fields) {
      expect(field.confidence).toBeGreaterThanOrEqual(0.85);
    }
  });
});
