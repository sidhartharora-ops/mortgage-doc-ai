import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import path from "path";

// Mock Prisma for integration tests (avoid needing real DB)
vi.mock("@/lib/db", () => ({
  prisma: {
    document: {
      update: vi.fn().mockResolvedValue({}),
    },
    extractedField: {
      upsert: vi.fn().mockResolvedValue({}),
    },
    agentRun: {
      create: vi.fn().mockResolvedValue({}),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

import { ClassificationAgent } from "@/lib/agents/classification-agent";
import { ExtractionAgent } from "@/lib/agents/extraction-agent";
import { ValidationAgent } from "@/lib/agents/validation-agent";
import { calculateConfidence } from "@/lib/confidence/engine";
import { loadValidationRules } from "@/lib/validation/rules";

describe("Pipeline Integration (deterministic)", () => {
  it("runs full classification → extraction → validation pipeline for T4", async () => {
    const rawText = fs.readFileSync(
      path.join(__dirname, "../golden/t4_sample_1.raw.txt"),
      "utf-8"
    );
    const filename = "t4_sample_1.pdf";

    // Step 1: Classification
    const classAgent = new ClassificationAgent();
    const classResult = await classAgent.run({ rawText, filename }, { deterministic: true });
    expect(classResult.status).toBe("success");

    const classOutput = classResult.output as { documentType: string; confidence: number };
    expect(classOutput.documentType).toBe("t4");

    // Step 2: Extraction
    const extAgent = new ExtractionAgent();
    const extResult = await extAgent.run(
      { rawText, documentType: classOutput.documentType },
      { deterministic: true }
    );
    expect(extResult.status).toBe("success");

    const extOutput = extResult.output as { fields: { fieldName: string; value: string; confidence: number }[] };
    expect(extOutput.fields.length).toBeGreaterThan(0);

    // Step 3: Validation
    const valAgent = new ValidationAgent();
    const valResult = await valAgent.run(
      { documentType: classOutput.documentType, fields: extOutput.fields },
      { deterministic: true }
    );
    expect(valResult.status).toBe("success");

    const valOutput = valResult.output as { valid: boolean; crossFieldScore: number };

    // Step 4: Confidence
    const confidence = calculateConfidence({
      modelConfidence: classOutput.confidence,
      validationScore: valOutput.valid ? 1.0 : 0.5,
      crossFieldScore: valOutput.crossFieldScore,
    });

    expect(confidence.score).toBeGreaterThan(0.8);

    // Verify agent traceability
    expect(classResult.metadata.input_hash).toHaveLength(64);
    expect(classResult.metadata.output_hash).toHaveLength(64);
    expect(extResult.metadata.input_hash).toHaveLength(64);
    expect(valResult.metadata.input_hash).toHaveLength(64);
  });

  it("pipeline config loads correctly", () => {
    const configPath = path.join(process.cwd(), "specs", "pipeline.yaml");
    expect(fs.existsSync(configPath)).toBe(true);

    const YAML = require("yaml");
    const config = YAML.parse(fs.readFileSync(configPath, "utf-8"));
    expect(config.name).toBe("mortgage-document-pipeline");
    expect(config.steps).toHaveLength(3);
    expect(config.steps[0].agent).toBe("classification");
    expect(config.steps[1].agent).toBe("extraction");
    expect(config.steps[2].agent).toBe("validation");
  });

  it("validation rules load for all document types", () => {
    for (const docType of ["t4", "noa", "paystub", "bank_statement", "employment_letter"]) {
      const rules = loadValidationRules(docType);
      expect(rules.length).toBeGreaterThan(0);
    }
  });

  it("all agents produce consistent hash outputs for same input", async () => {
    const agent = new ClassificationAgent();
    const input = { rawText: "Test content", filename: "test_t4.pdf" };

    const result1 = await agent.run(input, { deterministic: true });
    const result2 = await agent.run(input, { deterministic: true });

    // Same input → same hashes (deterministic)
    expect(result1.metadata.input_hash).toBe(result2.metadata.input_hash);
    expect(result1.metadata.output_hash).toBe(result2.metadata.output_hash);
  });

  it("different inputs produce different hashes", async () => {
    const agent = new ClassificationAgent();

    const result1 = await agent.run(
      { rawText: "T4 content A", filename: "t4_a.pdf" },
      { deterministic: true }
    );
    const result2 = await agent.run(
      { rawText: "NOA content B", filename: "noa_b.pdf" },
      { deterministic: true }
    );

    expect(result1.metadata.input_hash).not.toBe(result2.metadata.input_hash);
    expect(result1.metadata.output_hash).not.toBe(result2.metadata.output_hash);
  });
});
