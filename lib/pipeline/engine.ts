import fs from "fs";
import path from "path";
import YAML from "yaml";
import { Agent, AgentResult, AgentOptions } from "@/lib/agents/types";
import { ClassificationAgent } from "@/lib/agents/classification-agent";
import { ExtractionAgent } from "@/lib/agents/extraction-agent";
import { ValidationAgent } from "@/lib/agents/validation-agent";
import { prisma } from "@/lib/db";
import { logAgentExecution } from "@/lib/audit/logger";
import { calculateConfidence } from "@/lib/confidence/engine";

const PIPELINE_VERSION = process.env.PIPELINE_VERSION || "1.0.0";

interface PipelineStepConfig {
  agent: string;
  version: string;
}

interface PipelineConfig {
  name: string;
  version: string;
  steps: PipelineStepConfig[];
}

interface PipelineResult {
  documentId: string;
  documentType: string | null;
  fields: { fieldName: string; value: string; confidence: number }[];
  requiresReview: boolean;
  overallConfidence: number;
  agentResults: AgentResult[];
}

const AGENT_REGISTRY: Record<string, () => Agent> = {
  classification: () => new ClassificationAgent(),
  extraction: () => new ExtractionAgent(),
  validation: () => new ValidationAgent(),
};

export function loadPipelineConfig(): PipelineConfig {
  const configPath = path.join(process.cwd(), "specs", "pipeline.yaml");
  const content = fs.readFileSync(configPath, "utf-8");
  return YAML.parse(content) as PipelineConfig;
}

export async function runPipeline(
  documentId: string,
  rawText: string,
  filename: string,
  options?: AgentOptions
): Promise<PipelineResult> {
  const config = loadPipelineConfig();
  const agentResults: AgentResult[] = [];
  let documentType: string | null = null;
  let extractedFields: { fieldName: string; value: string; confidence: number }[] = [];
  let validationScore = 1.0;
  let crossFieldScore = 1.0;
  let modelConfidence = 0;

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "processing" },
  });

  for (const step of config.steps) {
    const createAgent = AGENT_REGISTRY[step.agent];
    if (!createAgent) {
      console.error(`Unknown agent: ${step.agent}`);
      continue;
    }

    const agent = createAgent();
    let input: unknown;

    switch (step.agent) {
      case "classification":
        input = { rawText, filename };
        break;
      case "extraction":
        input = { rawText, documentType: documentType || "unknown" };
        break;
      case "validation":
        input = { documentType: documentType || "unknown", fields: extractedFields };
        break;
      default:
        input = { rawText };
    }

    const result = await agent.run(input, options);
    agentResults.push(result);

    // Store agent run
    await prisma.agentRun.create({
      data: {
        documentId,
        agentName: result.agent_name,
        version: result.version,
        status: result.status,
        confidenceOverall: result.confidence_overall,
        output: JSON.stringify(result.output),
        inputHash: result.metadata.input_hash,
        outputHash: result.metadata.output_hash,
        modelUsed: result.metadata.model_used,
        latencyMs: result.metadata.latency_ms,
        pipelineVersion: PIPELINE_VERSION,
      },
    });

    // Write audit log
    await logAgentExecution(documentId, result);

    // Process agent output
    if (step.agent === "classification" && result.status === "success") {
      const output = result.output as { documentType: string; confidence: number };
      documentType = output.documentType;
      modelConfidence = output.confidence;
      await prisma.document.update({
        where: { id: documentId },
        data: { documentType },
      });
    }

    if (step.agent === "extraction" && result.status === "success") {
      const output = result.output as { fields: { fieldName: string; value: string; confidence: number }[] };
      extractedFields = output.fields;
      modelConfidence = result.confidence_overall;

      // Store extracted fields
      for (const field of extractedFields) {
        await prisma.extractedField.upsert({
          where: { documentId_fieldName: { documentId, fieldName: field.fieldName } },
          create: {
            documentId,
            fieldName: field.fieldName,
            value: field.value,
            confidence: field.confidence,
            source: result.agent_name,
            requiresReview: field.confidence < 0.85,
          },
          update: {
            value: field.value,
            confidence: field.confidence,
            source: result.agent_name,
            requiresReview: field.confidence < 0.85,
          },
        });
      }
    }

    if (step.agent === "validation" && result.status === "success") {
      const output = result.output as { valid: boolean; crossFieldScore: number; issues: unknown[] };
      validationScore = output.valid ? 1.0 : 0.5;
      crossFieldScore = output.crossFieldScore;
    }
  }

  // Calculate overall confidence
  const { score, requiresReview } = calculateConfidence({
    modelConfidence,
    validationScore,
    crossFieldScore,
  });

  // Update document status
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: requiresReview ? "review" : "extracted",
      requiresReview,
      processedAt: new Date(),
    },
  });

  return {
    documentId,
    documentType,
    fields: extractedFields,
    requiresReview,
    overallConfidence: score,
    agentResults,
  };
}
