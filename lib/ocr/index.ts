/**
 * OCR Abstraction Layer
 *
 * This module provides a pluggable interface for text extraction from documents.
 * In production, swap the implementation to use a real OCR service
 * (Google Vision, AWS Textract, Azure Document Intelligence, etc.)
 *
 * For sandbox/testing, it extracts text from PDFs using built-in zlib
 * and handles plain text files directly.
 */

import { inflateSync } from "zlib";

export interface OcrResult {
  text: string;
  pages: number;
  confidence: number;
}

export interface OcrProvider {
  extractText(fileBuffer: Buffer, mimeType: string): Promise<OcrResult>;
}

/**
 * Extract text from PDF content streams using Node.js built-in zlib.
 * Handles FlateDecode compressed streams and parses PDF text operators.
 */
function extractPdfText(buffer: Buffer): string {
  const raw = buffer.toString("binary");
  const texts: string[] = [];

  // Find all stream...endstream blocks
  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  let match;

  while ((match = streamRegex.exec(raw)) !== null) {
    const streamBytes = Buffer.from(match[1], "binary");
    let decoded: string;

    try {
      // Try FlateDecode decompression
      const inflated = inflateSync(streamBytes);
      decoded = inflated.toString("binary");
    } catch {
      // Not compressed or different encoding — use raw
      decoded = match[1];
    }

    // Parse PDF text operators: Tj, TJ, ', "
    // Tj: (text) Tj
    // TJ: [(text) num (text) ...] TJ
    // ': (text) '
    const tjMatches = decoded.matchAll(/\(([^)]*)\)\s*Tj/g);
    for (const m of tjMatches) {
      texts.push(decodePdfString(m[1]));
    }

    const tjArrayMatches = decoded.matchAll(/\[(.*?)\]\s*TJ/g);
    for (const m of tjArrayMatches) {
      const parts = m[1].matchAll(/\(([^)]*)\)/g);
      const line: string[] = [];
      for (const p of parts) {
        line.push(decodePdfString(p[1]));
      }
      texts.push(line.join(""));
    }

    const quoteMatches = decoded.matchAll(/\(([^)]*)\)\s*'/g);
    for (const m of quoteMatches) {
      texts.push(decodePdfString(m[1]));
    }
  }

  return texts.join("\n").trim();
}

/** Decode PDF escape sequences in string literals */
function decodePdfString(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

/** Sandbox OCR provider — extracts text from PDFs and plain text files */
class SandboxOcrProvider implements OcrProvider {
  async extractText(fileBuffer: Buffer, mimeType: string): Promise<OcrResult> {
    // Plain text files
    if (mimeType === "text/plain" || mimeType === "text/csv") {
      const text = fileBuffer.toString("utf-8");
      return { text, pages: 1, confidence: 1.0 };
    }

    // PDF files — extract text from content streams
    if (mimeType === "application/pdf" || mimeType.includes("pdf")) {
      try {
        const text = extractPdfText(fileBuffer);
        if (text.length > 0) {
          return { text, pages: 1, confidence: 0.9 };
        }
        return {
          text: "[OCR: PDF contains no extractable text layer — scanned image. Use a production OCR provider.]",
          pages: 1,
          confidence: 0.1,
        };
      } catch {
        return {
          text: "[OCR: Failed to parse PDF. Use a production OCR provider.]",
          pages: 1,
          confidence: 0.1,
        };
      }
    }

    // Other binary formats (images, etc.)
    return {
      text: "[OCR: Binary content — not supported in sandbox. Use a production OCR provider.]",
      pages: 1,
      confidence: 0.1,
    };
  }
}

// Default to sandbox provider — swap in production
let currentProvider: OcrProvider = new SandboxOcrProvider();

export function setOcrProvider(provider: OcrProvider): void {
  currentProvider = provider;
}

export function getOcrProvider(): OcrProvider {
  return currentProvider;
}

export async function extractText(fileBuffer: Buffer, mimeType: string): Promise<OcrResult> {
  return currentProvider.extractText(fileBuffer, mimeType);
}
