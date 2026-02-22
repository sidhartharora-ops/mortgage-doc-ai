import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { extractText } from "@/lib/ocr";
import { runPipeline } from "@/lib/pipeline/engine";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";

    // Extract text via OCR abstraction
    const ocrResult = await extractText(buffer, mimeType);

    // Strip null bytes — PostgreSQL text columns reject \x00
    const cleanText = ocrResult.text.replace(/\x00/g, "");

    // Create document record
    const document = await prisma.document.create({
      data: {
        filename: file.name,
        mimeType,
        rawText: cleanText,
        status: "uploaded",
      },
    });

    // Run agent pipeline
    const deterministic = process.env.DETERMINISTIC_MODE === "true";
    const result = await runPipeline(document.id, cleanText, file.name, { deterministic });

    return Response.json({
      documentId: document.id,
      documentType: result.documentType,
      fieldsExtracted: result.fields.length,
      overallConfidence: result.overallConfidence,
      requiresReview: result.requiresReview,
      status: result.requiresReview ? "review" : "extracted",
    });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
