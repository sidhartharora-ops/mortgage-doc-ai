import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ReviewTable from "@/components/ReviewTable";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import InfoIcon from "@/components/InfoIcon";

export const dynamic = "force-dynamic";

export default async function DocumentReviewPage({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      extractedFields: { orderBy: { fieldName: "asc" } },
      agentRuns: { orderBy: { executedAt: "asc" } },
      auditLogs: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!document) return notFound();

  const overallConfidence = document.agentRuns.length > 0
    ? document.agentRuns.reduce((sum, r) => sum + r.confidenceOverall, 0) / document.agentRuns.length
    : 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>{document.filename}</h2>
        <ConfidenceBadge confidence={overallConfidence} size="md" />
        {document.requiresReview && (
          <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: "#fefce8", color: "#ca8a04" }}>
            Needs Review
          </span>
        )}
      </div>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>
        ID: <strong style={{ fontFamily: "monospace", fontSize: 11 }}>{document.id}</strong><InfoIcon tooltip="Unique document identifier (CUID format)" />
        {" | "}Type: <strong>{document.documentType || "Unknown"}</strong><InfoIcon tooltip="Document classification: t4, noa, paystub, bank_statement, or employment_letter" />
        {" | "}Status: <strong>{document.status}</strong><InfoIcon tooltip="Lifecycle: uploaded → processing → extracted → review → approved" />
        {" | "}Uploaded: {document.uploadedAt.toISOString().slice(0, 16)}
      </p>

      <h3 style={{ marginBottom: 8 }}>Extracted Fields</h3>
      <div style={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 24 }}>
        <ReviewTable fields={document.extractedFields} documentId={documentId} />
      </div>

      <h3 style={{ marginBottom: 8 }}>Agent Runs</h3>
      <div style={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: "8px 12px" }}>Agent</th>
              <th style={{ padding: "8px 12px" }}>Version</th>
              <th style={{ padding: "8px 12px" }}>Status</th>
              <th style={{ padding: "8px 12px" }}>Confidence<InfoIcon tooltip="Agent's self-assessed accuracy score (0-100%)" /></th>
              <th style={{ padding: "8px 12px" }}>Model<InfoIcon tooltip="The AI model or rule engine used for this step" /></th>
              <th style={{ padding: "8px 12px" }}>Latency<InfoIcon tooltip="Processing time for this agent step in milliseconds" /></th>
            </tr>
          </thead>
          <tbody>
            {document.agentRuns.map((run) => (
              <tr key={run.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{run.agentName}</td>
                <td style={{ padding: "8px 12px" }}>{run.version}</td>
                <td style={{ padding: "8px 12px" }}>
                  <span style={{ color: run.status === "success" ? "#16a34a" : "#dc2626" }}>{run.status}</span>
                </td>
                <td style={{ padding: "8px 12px" }}><ConfidenceBadge confidence={run.confidenceOverall} /></td>
                <td style={{ padding: "8px 12px", fontSize: 11, fontFamily: "monospace" }}>{run.modelUsed}</td>
                <td style={{ padding: "8px 12px" }}>{run.latencyMs}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginBottom: 8 }}>Audit Trail</h3>
      <div style={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: "8px 12px" }}>Timestamp</th>
              <th style={{ padding: "8px 12px" }}>Agent</th>
              <th style={{ padding: "8px 12px" }}>Input Hash<InfoIcon tooltip="SHA-256 hash of the agent's input data, used for reproducibility verification" /></th>
              <th style={{ padding: "8px 12px" }}>Output Hash<InfoIcon tooltip="SHA-256 hash of the agent's output, detects if results change across versions" /></th>
              <th style={{ padding: "8px 12px" }}>Confidence<InfoIcon tooltip="Agent's self-assessed accuracy score (0-100%)" /></th>
            </tr>
          </thead>
          <tbody>
            {document.auditLogs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 12px" }}>{log.timestamp.toISOString().slice(0, 19)}</td>
                <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{log.agentName} v{log.version}</td>
                <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 10 }}>{log.inputHash.slice(0, 12)}...</td>
                <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 10 }}>{log.outputHash.slice(0, 12)}...</td>
                <td style={{ padding: "8px 12px" }}><ConfidenceBadge confidence={log.confidence} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
