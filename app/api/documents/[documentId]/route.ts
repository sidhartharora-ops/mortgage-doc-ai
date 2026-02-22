import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      extractedFields: { orderBy: { fieldName: "asc" } },
      agentRuns: { orderBy: { executedAt: "asc" } },
      auditLogs: { orderBy: { timestamp: "asc" } },
      reviewAudits: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!document) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  return Response.json(document);
}
