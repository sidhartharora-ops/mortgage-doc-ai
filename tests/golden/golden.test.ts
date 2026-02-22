import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { ClassificationAgent } from "@/lib/agents/classification-agent";
import { ExtractionAgent } from "@/lib/agents/extraction-agent";
import { ValidationAgent } from "@/lib/agents/validation-agent";
import { calculateConfidence } from "@/lib/confidence/engine";

const GOLDEN_DIR = path.join(__dirname);
const CONFIDENCE_TOLERANCE = 0.15; // Allow 15% variance in confidence

interface ExpectedOutput {
  documentType: string;
  fields: Record<string, string>;
  requiresReview: boolean;
  validation: { valid: boolean; issues: unknown[] };
}

async function runGoldenTest(baseName: string) {
  const rawText = fs.readFileSync(path.join(GOLDEN_DIR, `${baseName}.raw.txt`), "utf-8");
  const expected: ExpectedOutput = JSON.parse(
    fs.readFileSync(path.join(GOLDEN_DIR, `${baseName}.expected.json`), "utf-8")
  );

  // Step 1: Classification
  const classAgent = new ClassificationAgent();
  const classResult = await classAgent.run(
    { rawText, filename: `${baseName}.pdf` },
    { deterministic: true }
  );
  const classOutput = classResult.output as { documentType: string; confidence: number };

  // Step 2: Extraction
  const extAgent = new ExtractionAgent();
  const extResult = await extAgent.run(
    { rawText, documentType: classOutput.documentType },
    { deterministic: true }
  );
  const extOutput = extResult.output as { fields: { fieldName: string; value: string; confidence: number }[] };

  // Step 3: Validation
  const valAgent = new ValidationAgent();
  const valResult = await valAgent.run(
    { documentType: classOutput.documentType, fields: extOutput.fields },
    { deterministic: true }
  );
  const valOutput = valResult.output as { valid: boolean; crossFieldScore: number };

  // Step 4: Confidence
  const confidence = calculateConfidence({
    modelConfidence: classOutput.confidence,
    validationScore: valOutput.valid ? 1.0 : 0.5,
    crossFieldScore: valOutput.crossFieldScore,
  });

  return { classOutput, extOutput, valOutput, confidence, expected };
}

describe("Golden Tests", () => {
  describe("T4 Sample 1", () => {
    it("classifies as T4", async () => {
      const { classOutput } = await runGoldenTest("t4_sample_1");
      expect(classOutput.documentType).toBe("t4");
    });

    it("extracts expected fields", async () => {
      const { extOutput, expected } = await runGoldenTest("t4_sample_1");
      const fieldMap = new Map(extOutput.fields.map((f) => [f.fieldName, f.value]));
      for (const [key, val] of Object.entries(expected.fields)) {
        expect(fieldMap.get(key)).toBe(val);
      }
    });

    it("passes validation", async () => {
      const { valOutput } = await runGoldenTest("t4_sample_1");
      expect(valOutput.valid).toBe(true);
    });

    it("overall confidence above threshold", async () => {
      const { confidence } = await runGoldenTest("t4_sample_1");
      expect(confidence.score).toBeGreaterThanOrEqual(0.85 - CONFIDENCE_TOLERANCE);
      expect(confidence.requiresReview).toBe(false);
    });
  });

  describe("NOA Sample 1", () => {
    it("classifies as NOA", async () => {
      const { classOutput } = await runGoldenTest("noa_sample_1");
      expect(classOutput.documentType).toBe("noa");
    });

    it("extracts expected fields", async () => {
      const { extOutput, expected } = await runGoldenTest("noa_sample_1");
      const fieldMap = new Map(extOutput.fields.map((f) => [f.fieldName, f.value]));
      for (const [key, val] of Object.entries(expected.fields)) {
        expect(fieldMap.get(key)).toBe(val);
      }
    });

    it("passes validation", async () => {
      const { valOutput } = await runGoldenTest("noa_sample_1");
      expect(valOutput.valid).toBe(true);
    });
  });

  describe("Employment Letter Sample 1", () => {
    it("classifies as employment_letter", async () => {
      const { classOutput } = await runGoldenTest("employment_letter_sample_1");
      expect(classOutput.documentType).toBe("employment_letter");
    });

    it("extracts expected fields", async () => {
      const { extOutput, expected } = await runGoldenTest("employment_letter_sample_1");
      const fieldMap = new Map(extOutput.fields.map((f) => [f.fieldName, f.value]));
      for (const [key, val] of Object.entries(expected.fields)) {
        expect(fieldMap.get(key)).toBe(val);
      }
    });

    it("passes validation", async () => {
      const { valOutput } = await runGoldenTest("employment_letter_sample_1");
      expect(valOutput.valid).toBe(true);
    });
  });
});
