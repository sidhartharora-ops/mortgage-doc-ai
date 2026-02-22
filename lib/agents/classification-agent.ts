import Anthropic from "@anthropic-ai/sdk";
import { BaseAgent } from "./base-agent";
import { readPrompt } from "@/lib/agents/prompt-loader";

const VALID_DOC_TYPES = ["t4", "noa", "paystub", "bank_statement", "employment_letter"] as const;
export type DocumentType = (typeof VALID_DOC_TYPES)[number];

interface ClassificationInput {
  rawText: string;
  filename: string;
}

interface ClassificationOutput {
  documentType: DocumentType | "unknown";
  confidence: number;
  reasoning: string;
}

export class ClassificationAgent extends BaseAgent {
  name = "classification";
  version = "1.0.0";

  protected getFixtureOutput(input: unknown): ClassificationOutput {
    const { filename } = input as ClassificationInput;
    const lower = filename.toLowerCase();
    if (lower.includes("t4")) return { documentType: "t4", confidence: 0.98, reasoning: "Fixture: filename contains t4" };
    if (lower.includes("noa")) return { documentType: "noa", confidence: 0.97, reasoning: "Fixture: filename contains noa" };
    if (lower.includes("paystub") || lower.includes("pay")) return { documentType: "paystub", confidence: 0.96, reasoning: "Fixture: filename contains paystub" };
    if (lower.includes("bank") || lower.includes("statement")) return { documentType: "bank_statement", confidence: 0.95, reasoning: "Fixture: filename contains bank" };
    if (lower.includes("employ") || lower.includes("letter") || lower.includes("verification")) return { documentType: "employment_letter", confidence: 0.95, reasoning: "Fixture: filename contains employment/letter" };
    return { documentType: "unknown", confidence: 0.5, reasoning: "Fixture: could not determine type" };
  }

  protected async execute(input: unknown): Promise<{ output: ClassificationOutput; confidence: number; model: string }> {
    const { rawText, filename } = input as ClassificationInput;
    const client = new Anthropic();
    const systemPrompt = readPrompt("classification");

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `${systemPrompt}\n\nFilename: ${filename}\n\nDocument text (first 3000 chars):\n${rawText.slice(0, 3000)}`,
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text");
    if (!text || !("text" in text)) throw new Error("No text response from Claude");

    const jsonMatch = text.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in classification response");

    const parsed = JSON.parse(jsonMatch[0]) as ClassificationOutput;
    return {
      output: parsed,
      confidence: parsed.confidence,
      model: "claude-sonnet-4-5-20250929",
    };
  }
}
