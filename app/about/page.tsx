export default function AboutPage() {
  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    padding: 20,
    marginBottom: 16,
  };

  const headingStyle = {
    fontSize: 16,
    fontWeight: 700 as const,
    marginBottom: 8,
    marginTop: 0,
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ marginBottom: 4 }}>About Mortgage Doc AI</h2>
      <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>
        System overview, processing pipeline, and technical details.
      </p>

      <div style={cardStyle}>
        <h3 style={headingStyle}>What is Mortgage Doc AI?</h3>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#334155" }}>
          Mortgage Doc AI is a sandbox web application for Canadian mortgage income document ingestion
          and review. Documents are uploaded, text-extracted, run through a configurable AI agent pipeline,
          and presented for human review with field-level confidence scores. Every agent decision is logged
          immutably for full auditability.
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>How It Works</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {["Upload", "Classify", "Extract", "Validate", "Review"].map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: "50%", backgroundColor: "#2563eb",
                color: "#fff", fontSize: 13, fontWeight: 700,
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>{step}</span>
              {i < 4 && <span style={{ color: "#cbd5e1", fontSize: 18 }}>&rarr;</span>}
            </div>
          ))}
        </div>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8, color: "#334155" }}>
          <li><strong>Upload</strong> &mdash; User uploads a PDF or text file via the web interface</li>
          <li><strong>Classify</strong> &mdash; Classification agent identifies the document type using Claude Sonnet</li>
          <li><strong>Extract</strong> &mdash; Extraction agent pulls structured fields (income, tax, employer, etc.)</li>
          <li><strong>Validate</strong> &mdash; Validation agent checks financial consistency using rule engine</li>
          <li><strong>Review</strong> &mdash; Documents below confidence threshold are flagged for human review</li>
        </ol>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Supported Document Types</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <tbody>
            {[
              ["T4", "CRA Statement of Remuneration Paid — employment income, tax deductions, CPP/EI contributions"],
              ["NOA", "CRA Notice of Assessment — total income, net income, taxable income, tax payable"],
              ["Paystub", "Employer pay statement — gross/net pay, deductions, pay period, YTD totals"],
              ["Bank Statement", "Account statement — balances, deposits, withdrawals, transaction history"],
              ["Employment Letter", "Employment verification — job title, salary, start date, employer details"],
            ].map(([type, desc]) => (
              <tr key={type} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600, whiteSpace: "nowrap", verticalAlign: "top" }}>{type}</td>
                <td style={{ padding: "8px 12px", color: "#64748b" }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Confidence Scoring</h3>
        <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.6, color: "#334155" }}>
          Each document receives an overall confidence score calculated from three factors:
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: "6px 12px" }}>Factor</th>
              <th style={{ padding: "6px 12px" }}>Weight</th>
              <th style={{ padding: "6px 12px" }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "6px 12px", fontWeight: 600 }}>Model Confidence</td>
              <td style={{ padding: "6px 12px" }}>40%</td>
              <td style={{ padding: "6px 12px", color: "#64748b" }}>AI model's self-assessed accuracy for classification/extraction</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "6px 12px", fontWeight: 600 }}>Validation Score</td>
              <td style={{ padding: "6px 12px" }}>35%</td>
              <td style={{ padding: "6px 12px", color: "#64748b" }}>Whether extracted fields pass financial consistency rules</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "6px 12px", fontWeight: 600 }}>Cross-Field Score</td>
              <td style={{ padding: "6px 12px" }}>25%</td>
              <td style={{ padding: "6px 12px", color: "#64748b" }}>Consistency between related fields (e.g., income vs. tax)</td>
            </tr>
          </tbody>
        </table>
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "#64748b" }}>
          Documents scoring below 85% are automatically flagged for human review.
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Audit Trail</h3>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#334155" }}>
          Every agent execution is logged with SHA-256 hashes of both input and output data.
          This creates an immutable, append-only audit trail that enables:
        </p>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20, fontSize: 14, lineHeight: 1.8, color: "#334155" }}>
          <li><strong>Reproducibility</strong> &mdash; Same input hash confirms identical input data</li>
          <li><strong>Change detection</strong> &mdash; Different output hash for same input reveals model behavior changes</li>
          <li><strong>Compliance</strong> &mdash; Full chain of custody from upload through human review</li>
        </ul>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Technology</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <tbody>
            {[
              ["AI Model", "Claude Sonnet 4.5 (classification & extraction)"],
              ["Validation", "Rule engine with configurable YAML rules"],
              ["Framework", "Next.js 15 (App Router)"],
              ["Database", "PostgreSQL (Neon) via Prisma ORM"],
              ["OCR (Sandbox)", "Built-in PDF text extraction via zlib decompression"],
              ["Language", "TypeScript"],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "6px 12px", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</td>
                <td style={{ padding: "6px 12px", color: "#64748b" }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
