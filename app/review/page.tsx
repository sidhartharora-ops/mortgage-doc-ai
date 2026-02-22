import { prisma } from "@/lib/db";
import Link from "next/link";
import InfoIcon from "@/components/InfoIcon";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  const documents = await prisma.document.findMany({
    orderBy: { uploadedAt: "desc" },
    take: 50,
    include: { _count: { select: { extractedFields: true } } },
  });

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>Review Queue</h2>
      <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>
        All uploaded documents. Documents flagged for review are highlighted.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
            <th style={{ padding: "8px 12px" }}>ID<InfoIcon tooltip="Unique document identifier (CUID format)" /></th>
            <th style={{ padding: "8px 12px" }}>Filename</th>
            <th style={{ padding: "8px 12px" }}>Type<InfoIcon tooltip="Document classification: t4, noa, paystub, bank_statement, or employment_letter" /></th>
            <th style={{ padding: "8px 12px" }}>Status<InfoIcon tooltip="Lifecycle: uploaded → processing → extracted → review → approved" /></th>
            <th style={{ padding: "8px 12px" }}>Fields<InfoIcon tooltip="Number of structured fields extracted from the document" /></th>
            <th style={{ padding: "8px 12px" }}>Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id}
              style={{
                borderBottom: "1px solid #f1f5f9",
                backgroundColor: doc.requiresReview ? "#fffbeb" : "#fff",
              }}
            >
              <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 12 }}>
                <Link href={`/review/${doc.id}`} style={{ color: "#2563eb" }}>
                  {doc.id.slice(0, 8)}...
                </Link>
              </td>
              <td style={{ padding: "8px 12px" }}>{doc.filename}</td>
              <td style={{ padding: "8px 12px" }}>{doc.documentType || "—"}</td>
              <td style={{ padding: "8px 12px" }}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor:
                      doc.status === "approved" ? "#f0fdf4" :
                      doc.status === "review" ? "#fefce8" :
                      doc.status === "extracted" ? "#eff6ff" : "#f8fafc",
                    color:
                      doc.status === "approved" ? "#16a34a" :
                      doc.status === "review" ? "#ca8a04" :
                      doc.status === "extracted" ? "#2563eb" : "#64748b",
                  }}
                >
                  {doc.status}
                </span>
              </td>
              <td style={{ padding: "8px 12px" }}>{doc._count.extractedFields}</td>
              <td style={{ padding: "8px 12px", color: "#64748b", fontSize: 12 }}>
                {doc.uploadedAt.toISOString().slice(0, 16).replace("T", " ")}
              </td>
            </tr>
          ))}
          {documents.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
                No documents uploaded yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
