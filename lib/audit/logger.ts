import { prisma } from "@/lib/db";
import { AgentResult } from "@/lib/agents/types";

const PIPELINE_VERSION = process.env.PIPELINE_VERSION || "1.0.0";

/** Append-only: logs an agent execution to the audit trail */
export async function logAgentExecution(documentId: string, result: AgentResult): Promise<void> {
  await prisma.auditLog.create({
    data: {
      documentId,
      agentName: result.agent_name,
      version: result.version,
      inputHash: result.metadata.input_hash,
      outputHash: result.metadata.output_hash,
      confidence: result.confidence_overall,
      pipelineVersion: PIPELINE_VERSION,
    },
  });
}

/** Append-only: logs a human review override */
export async function logReviewAction(
  documentId: string,
  fieldName: string,
  originalValue: string,
  updatedValue: string,
  reviewer: string
): Promise<void> {
  await prisma.reviewAudit.create({
    data: {
      documentId,
      fieldName,
      originalValue,
      updatedValue,
      reviewer,
    },
  });
}
