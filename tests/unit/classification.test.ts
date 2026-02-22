import { describe, it, expect } from "vitest";
import { ClassificationAgent } from "@/lib/agents/classification-agent";

describe("ClassificationAgent (deterministic)", () => {
  const agent = new ClassificationAgent();

  it("classifies T4 document by filename", async () => {
    const result = await agent.run(
      { rawText: "Box 14 Employment Income 65000", filename: "employee_t4_2024.pdf" },
      { deterministic: true }
    );
    expect(result.status).toBe("success");
    expect(result.agent_name).toBe("classification");
    expect(result.version).toBe("1.0.0");
    const output = result.output as { documentType: string; confidence: number };
    expect(output.documentType).toBe("t4");
    expect(output.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("classifies NOA document", async () => {
    const result = await agent.run(
      { rawText: "Notice of Assessment Total Income", filename: "noa_2024.pdf" },
      { deterministic: true }
    );
    const output = result.output as { documentType: string };
    expect(output.documentType).toBe("noa");
  });

  it("classifies paystub document", async () => {
    const result = await agent.run(
      { rawText: "Gross Pay Net Pay Deductions", filename: "paystub_dec_2024.pdf" },
      { deterministic: true }
    );
    const output = result.output as { documentType: string };
    expect(output.documentType).toBe("paystub");
  });

  it("classifies bank statement", async () => {
    const result = await agent.run(
      { rawText: "Account Statement Opening Balance", filename: "bank_statement_nov.pdf" },
      { deterministic: true }
    );
    const output = result.output as { documentType: string };
    expect(output.documentType).toBe("bank_statement");
  });

  it("classifies employment letter", async () => {
    const result = await agent.run(
      { rawText: "Employment Verification currently employed annual salary", filename: "employment_letter.pdf" },
      { deterministic: true }
    );
    const output = result.output as { documentType: string };
    expect(output.documentType).toBe("employment_letter");
  });

  it("returns unknown for unrecognized document", async () => {
    const result = await agent.run(
      { rawText: "Random content", filename: "mystery_doc.pdf" },
      { deterministic: true }
    );
    const output = result.output as { documentType: string };
    expect(output.documentType).toBe("unknown");
  });

  it("includes correct metadata structure", async () => {
    const result = await agent.run(
      { rawText: "T4 data", filename: "t4.pdf" },
      { deterministic: true }
    );
    expect(result.metadata).toHaveProperty("latency_ms");
    expect(result.metadata).toHaveProperty("model_used", "deterministic-fixture");
    expect(result.metadata).toHaveProperty("input_hash");
    expect(result.metadata).toHaveProperty("output_hash");
    expect(result.metadata.input_hash).toHaveLength(64); // SHA-256 hex
    expect(result.metadata.output_hash).toHaveLength(64);
  });
});
