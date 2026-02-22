import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { logReviewAction } from "@/lib/audit/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  const body = await request.json();
  const { fieldName, newValue, reviewer } = body as {
    fieldName: string;
    newValue: string;
    reviewer: string;
  };

  if (!fieldName || newValue === undefined || !reviewer) {
    return Response.json({ error: "fieldName, newValue, and reviewer are required" }, { status: 400 });
  }

  const field = await prisma.extractedField.findUnique({
    where: { documentId_fieldName: { documentId, fieldName } },
  });

  if (!field) {
    return Response.json({ error: "Field not found" }, { status: 404 });
  }

  const originalValue = field.value;

  // Update the field
  await prisma.extractedField.update({
    where: { id: field.id },
    data: { value: newValue, confidence: 1.0, requiresReview: false },
  });

  // Record the review action
  await prisma.reviewAction.create({
    data: {
      documentId,
      fieldName,
      action: "override",
      oldValue: originalValue,
      newValue,
      reviewer,
    },
  });

  // Append-only audit log
  await logReviewAction(documentId, fieldName, originalValue, newValue, reviewer);

  return Response.json({ success: true, fieldName, originalValue, newValue });
}
