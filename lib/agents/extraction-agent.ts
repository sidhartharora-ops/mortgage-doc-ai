import Anthropic from "@anthropic-ai/sdk";
import { BaseAgent } from "./base-agent";
import { readPrompt } from "@/lib/agents/prompt-loader";

interface ExtractionInput {
  rawText: string;
  documentType: string;
}

interface ExtractedFieldResult {
  fieldName: string;
  value: string;
  confidence: number;
}

interface ExtractionOutput {
  documentType: string;
  fields: ExtractedFieldResult[];
}

const FIXTURE_FIELDS: Record<string, ExtractedFieldResult[]> = {
  t4: [
    { fieldName: "box14_employment_income", value: "65000.00", confidence: 0.95 },
    { fieldName: "box22_income_tax_deducted", value: "12500.00", confidence: 0.93 },
    { fieldName: "box26_cpp_contributions", value: "3754.45", confidence: 0.92 },
    { fieldName: "box18_ei_premiums", value: "1002.45", confidence: 0.91 },
    { fieldName: "employer_name", value: "Acme Corporation", confidence: 0.97 },
    { fieldName: "tax_year", value: "2024", confidence: 0.99 },
    { fieldName: "employee_name", value: "Jane Smith", confidence: 0.96 },
    { fieldName: "sin_last3", value: "789", confidence: 0.94 },
  ],
  noa: [
    { fieldName: "total_income", value: "72000.00", confidence: 0.94 },
    { fieldName: "net_income", value: "58500.00", confidence: 0.93 },
    { fieldName: "taxable_income", value: "56800.00", confidence: 0.92 },
    { fieldName: "total_tax_payable", value: "13200.00", confidence: 0.91 },
    { fieldName: "tax_year", value: "2024", confidence: 0.99 },
    { fieldName: "taxpayer_name", value: "Jane Smith", confidence: 0.96 },
  ],
  paystub: [
    { fieldName: "gross_pay", value: "5416.67", confidence: 0.94 },
    { fieldName: "net_pay", value: "3850.00", confidence: 0.93 },
    { fieldName: "pay_period", value: "2024-12-01 to 2024-12-15", confidence: 0.92 },
    { fieldName: "employer_name", value: "Acme Corporation", confidence: 0.96 },
    { fieldName: "employee_name", value: "Jane Smith", confidence: 0.97 },
    { fieldName: "ytd_gross", value: "62500.00", confidence: 0.91 },
    { fieldName: "federal_tax", value: "850.00", confidence: 0.90 },
    { fieldName: "cpp_deduction", value: "312.87", confidence: 0.90 },
    { fieldName: "ei_deduction", value: "83.54", confidence: 0.90 },
  ],
  bank_statement: [
    { fieldName: "account_holder", value: "Jane Smith", confidence: 0.95 },
    { fieldName: "account_number_last4", value: "4532", confidence: 0.97 },
    { fieldName: "statement_period", value: "2024-11-01 to 2024-11-30", confidence: 0.94 },
    { fieldName: "opening_balance", value: "12500.00", confidence: 0.93 },
    { fieldName: "closing_balance", value: "14200.00", confidence: 0.92 },
    { fieldName: "total_deposits", value: "6200.00", confidence: 0.91 },
    { fieldName: "total_withdrawals", value: "4500.00", confidence: 0.90 },
    { fieldName: "institution_name", value: "TD Canada Trust", confidence: 0.96 },
  ],
  employment_letter: [
    { fieldName: "employee_name", value: "John Alexander Smith", confidence: 0.96 },
    { fieldName: "employer_name", value: "Maple Financial Corp.", confidence: 0.97 },
    { fieldName: "job_title", value: "Senior Software Engineer", confidence: 0.95 },
    { fieldName: "department", value: "Information Technology", confidence: 0.94 },
    { fieldName: "employment_type", value: "Full-Time, Permanent", confidence: 0.95 },
    { fieldName: "start_date", value: "2020-06-15", confidence: 0.93 },
    { fieldName: "annual_salary", value: "98500.00", confidence: 0.95 },
    { fieldName: "annual_bonus", value: "7500.00", confidence: 0.93 },
    { fieldName: "total_compensation", value: "106000.00", confidence: 0.94 },
    { fieldName: "work_location", value: "Toronto, Ontario", confidence: 0.95 },
  ],
};

export class ExtractionAgent extends BaseAgent {
  name = "extraction";
  version = "1.0.0";

  protected getFixtureOutput(input: unknown): ExtractionOutput {
    const { documentType } = input as ExtractionInput;
    return {
      documentType,
      fields: FIXTURE_FIELDS[documentType] || [],
    };
  }

  protected async execute(input: unknown): Promise<{ output: ExtractionOutput; confidence: number; model: string }> {
    const { rawText, documentType } = input as ExtractionInput;
    const client = new Anthropic();
    const systemPrompt = readPrompt("extraction");

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `${systemPrompt}\n\nDocument type: ${documentType}\n\nDocument text:\n${rawText.slice(0, 5000)}`,
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text");
    if (!text || !("text" in text)) throw new Error("No text response from Claude");

    const jsonMatch = text.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in extraction response");

    const parsed = JSON.parse(jsonMatch[0]) as ExtractionOutput;
    const avgConfidence =
      parsed.fields.length > 0
        ? parsed.fields.reduce((sum, f) => sum + f.confidence, 0) / parsed.fields.length
        : 0;

    return {
      output: parsed,
      confidence: avgConfidence,
      model: "claude-sonnet-4-5-20250929",
    };
  }
}
