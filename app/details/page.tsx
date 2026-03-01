export const metadata = {
  title: "More Details — Mortgage Doc AI",
  description: "Project overview, architecture, and technical details",
};

export default function DetailsPage() {
  return (
    <div style={{ margin: "-24px", backgroundColor: "#0f172a", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .slide {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 120px;
          border-bottom: 1px solid #1e293b;
          position: relative;
        }
        .slide-number {
          position: absolute;
          bottom: 30px;
          right: 60px;
          font-size: 14px;
          color: #475569;
        }
        .slide h1 { font-size: 52px; font-weight: 800; margin-bottom: 16px; line-height: 1.1; }
        .slide h2 { font-size: 38px; font-weight: 700; margin-bottom: 32px; color: #f8fafc; }
        .slide h3 { font-size: 22px; font-weight: 600; margin-bottom: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; }
        .accent { color: #3b82f6; }
        .green { color: #22c55e; }
        .yellow { color: #eab308; }
        .purple { color: #a78bfa; }
        .subtitle { font-size: 22px; color: #94a3b8; line-height: 1.6; max-width: 800px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
        .dcard { background: #1e293b; border-radius: 12px; padding: 28px; border: 1px solid #334155; }
        .dcard h4 { font-size: 20px; margin-bottom: 12px; color: #f1f5f9; }
        .dcard p, .dcard li { font-size: 16px; color: #94a3b8; line-height: 1.7; }
        .dcard ul { padding-left: 20px; }
        .pipeline { display: flex; align-items: center; gap: 0; margin: 40px 0; }
        .pipeline-step { flex: 1; text-align: center; padding: 24px 16px; background: #1e293b; border: 1px solid #334155; position: relative; }
        .pipeline-step:first-child { border-radius: 12px 0 0 12px; }
        .pipeline-step:last-child { border-radius: 0 12px 12px 0; }
        .pipeline-step .num { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: #3b82f6; color: #fff; font-weight: 700; font-size: 16px; margin-bottom: 8px; }
        .pipeline-step .label { font-size: 18px; font-weight: 600; color: #f1f5f9; }
        .pipeline-step .detail { font-size: 13px; color: #64748b; margin-top: 4px; }
        .pipeline-arrow { font-size: 24px; color: #3b82f6; margin: 0 -4px; z-index: 1; }
        .prompt-box { background: #1e293b; border: 1px solid #334155; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 24px 28px; font-size: 17px; line-height: 1.8; color: #cbd5e1; max-width: 900px; margin: 20px 0; }
        .stat-row { display: flex; gap: 40px; margin: 32px 0; }
        .stat { text-align: center; }
        .stat .num { font-size: 48px; font-weight: 800; color: #3b82f6; line-height: 1; }
        .stat .label { font-size: 14px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .tech-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin: 4px; background: #1e293b; border: 1px solid #334155; color: #94a3b8; }
        .check-list { list-style: none; padding: 0; }
        .check-list li { font-size: 18px; padding: 8px 0; color: #cbd5e1; line-height: 1.5; }
        .check-list li::before { content: "\\2713"; color: #22c55e; font-weight: 700; margin-right: 12px; }
        .dtable { width: 100%; border-collapse: collapse; font-size: 16px; }
        .dtable th { text-align: left; padding: 12px 16px; color: #94a3b8; font-weight: 600; border-bottom: 2px solid #334155; }
        .dtable td { padding: 12px 16px; color: #cbd5e1; border-bottom: 1px solid #1e293b; }
        .formula { background: #1e293b; border-radius: 8px; padding: 16px 24px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 18px; color: #e2e8f0; display: inline-block; margin: 12px 0; border: 1px solid #334155; }
        .tag { font-size: 12px; padding: 2px 10px; border-radius: 10px; font-weight: 600; display: inline-block; margin-left: 8px; }
        .tag-blue { background: #1e3a5f; color: #60a5fa; }
        .tag-green { background: #14532d; color: #4ade80; }
        .tag-yellow { background: #422006; color: #facc15; }
        @media (max-width: 768px) {
          .slide { padding: 40px 24px; }
          .slide h1 { font-size: 32px; }
          .slide h2 { font-size: 26px; }
          .grid-2, .grid-3 { grid-template-columns: 1fr; }
          .pipeline { flex-direction: column; }
          .pipeline-step:first-child, .pipeline-step:last-child { border-radius: 12px; }
          .pipeline-arrow { transform: rotate(90deg); }
          .stat-row { flex-wrap: wrap; justify-content: center; }
        }
      `}} />

      {/* Slide 1: Title */}
      <div className="slide" style={{ textAlign: "center", justifyContent: "center", alignItems: "center" }}>
        <h3>Project Showcase</h3>
        <h1>Mortgage Doc <span className="accent">AI</span></h1>
        <p className="subtitle" style={{ textAlign: "center" }}>
          AI-powered Canadian mortgage document processing —<br />
          from upload to human review in seconds.
        </p>
        <div style={{ marginTop: 40 }}>
          <span className="tech-badge">Claude Sonnet 4.5</span>
          <span className="tech-badge">Next.js 15</span>
          <span className="tech-badge">Prisma + PostgreSQL</span>
          <span className="tech-badge">TypeScript</span>
        </div>
        <div className="slide-number">1 / 9</div>
      </div>

      {/* Slide 2: The Prompt */}
      <div className="slide">
        <h3>Starting Point</h3>
        <h2>The Prompt</h2>
        <div className="prompt-box">
          Build a <strong>sandbox web application</strong> for Canadian mortgage income document ingestion and review.
          Documents are uploaded, text-extracted via OCR, run through a <strong>configurable AI agent pipeline</strong>
          (classification &rarr; extraction &rarr; validation), and presented for <strong>human review</strong>
          with field-level confidence scores. Every agent decision must be <strong>logged immutably</strong> for full auditability.
        </div>
        <p style={{ color: "#64748b", fontSize: 16, marginTop: 24 }}>
          Requirements: 5 document types, deterministic test mode, append-only audit trail,<br />
          configurable validation rules, and confidence-based review flagging.
        </p>
        <div className="slide-number">2 / 9</div>
      </div>

      {/* Slide 3: Key Features */}
      <div className="slide">
        <h3>Capabilities</h3>
        <h2>Key Features</h2>
        <div className="grid-3">
          <div className="dcard">
            <h4><span className="accent">AI Classification</span></h4>
            <p>Claude Sonnet 4.5 automatically identifies document type from extracted text — T4, NOA, Paystub, Bank Statement, or Employment Letter.</p>
          </div>
          <div className="dcard">
            <h4><span className="accent">Field Extraction</span></h4>
            <p>Structured data pulled from unstructured documents with per-field confidence scores. Supports 40+ field types across 5 document categories.</p>
          </div>
          <div className="dcard">
            <h4><span className="accent">Rule-Based Validation</span></h4>
            <p>Configurable rules catch impossible values: tax &gt; income, negative salaries, missing required fields. YAML-overridable.</p>
          </div>
          <div className="dcard">
            <h4><span className="green">Confidence Scoring</span></h4>
            <p>3-factor weighted score (model 50%, validation 30%, cross-field 20%). Documents below 85% auto-flagged for human review.</p>
          </div>
          <div className="dcard">
            <h4><span className="green">Human Review Queue</span></h4>
            <p>Flagged documents presented with field-level confidence badges, override capability, and full audit visibility.</p>
          </div>
          <div className="dcard">
            <h4><span className="green">Immutable Audit Trail</span></h4>
            <p>Every agent execution logged with SHA-256 input/output hashes. Append-only — nothing deleted, full chain of custody.</p>
          </div>
        </div>
        <div className="slide-number">3 / 9</div>
      </div>

      {/* Slide 4: Architecture */}
      <div className="slide">
        <h3>System Design</h3>
        <h2>Architecture</h2>
        <div className="pipeline">
          <div className="pipeline-step" style={{ borderRadius: "12px 0 0 12px" }}>
            <div className="num">1</div><br />
            <div className="label">Upload</div>
            <div className="detail">PDF / TXT file</div>
          </div>
          <div className="pipeline-arrow">&rarr;</div>
          <div className="pipeline-step">
            <div className="num">2</div><br />
            <div className="label">OCR</div>
            <div className="detail">zlib PDF extraction</div>
          </div>
          <div className="pipeline-arrow">&rarr;</div>
          <div className="pipeline-step" style={{ borderColor: "#3b82f6" }}>
            <div className="num">3</div><br />
            <div className="label">Classify</div>
            <div className="detail">Claude Sonnet 4.5</div>
          </div>
          <div className="pipeline-arrow">&rarr;</div>
          <div className="pipeline-step" style={{ borderColor: "#3b82f6" }}>
            <div className="num">4</div><br />
            <div className="label">Extract</div>
            <div className="detail">Claude Sonnet 4.5</div>
          </div>
          <div className="pipeline-arrow">&rarr;</div>
          <div className="pipeline-step">
            <div className="num">5</div><br />
            <div className="label">Validate</div>
            <div className="detail">Rule engine</div>
          </div>
          <div className="pipeline-arrow">&rarr;</div>
          <div className="pipeline-step" style={{ borderRadius: "0 12px 12px 0" }}>
            <div className="num">6</div><br />
            <div className="label">Review</div>
            <div className="detail">Human-in-the-loop</div>
          </div>
        </div>
        <div className="grid-2" style={{ marginTop: 24 }}>
          <div className="dcard">
            <h4>Agent Framework</h4>
            <ul>
              <li>Modular agents with shared BaseAgent class</li>
              <li>Each agent versioned independently</li>
              <li>Deterministic fixture mode for testing</li>
              <li>Real Claude mode for production</li>
              <li>Pipeline config driven by YAML</li>
            </ul>
          </div>
          <div className="dcard">
            <h4>Data Layer</h4>
            <ul>
              <li>PostgreSQL (Neon) with Prisma ORM</li>
              <li>Isolated <code style={{ color: "#60a5fa" }}>mortgage</code> schema — safe multi-app DB sharing</li>
              <li>6 tables: documents, fields, agent_runs, review_actions, audit_logs, review_audits</li>
              <li>Cascade deletes for referential integrity</li>
            </ul>
          </div>
        </div>
        <div className="slide-number">4 / 9</div>
      </div>

      {/* Slide 5: Document Types */}
      <div className="slide">
        <h3>Coverage</h3>
        <h2>Supported Document Types</h2>
        <table className="dtable">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Key Fields</th>
              <th>Validation Rules</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>T4</strong></td>
              <td>Statement of Remuneration</td>
              <td>Box 14 income, Box 22 tax, CPP, EI, employer, SIN</td>
              <td>Income &gt;= Tax, range [0, 5M]</td>
            </tr>
            <tr>
              <td><strong>NOA</strong></td>
              <td>Notice of Assessment</td>
              <td>Total/net/taxable income, tax payable</td>
              <td>Total &gt;= Net &gt;= Taxable, Total &gt;= Tax</td>
            </tr>
            <tr>
              <td><strong>Paystub</strong></td>
              <td>Employer Pay Statement</td>
              <td>Gross/net pay, deductions, YTD</td>
              <td>Gross &gt;= Net, range [0, 500K]</td>
            </tr>
            <tr>
              <td><strong>Bank Statement</strong></td>
              <td>Account Statement</td>
              <td>Balances, deposits, withdrawals</td>
              <td>Balance range [-100K, 50M]</td>
            </tr>
            <tr>
              <td><strong>Employment Letter</strong></td>
              <td>Employment Verification</td>
              <td>Name, title, salary, start date, employer</td>
              <td>Salary range [0, 5M]</td>
            </tr>
          </tbody>
        </table>
        <div className="slide-number">5 / 9</div>
      </div>

      {/* Slide 6: Robustness */}
      <div className="slide">
        <h3>Engineering Quality</h3>
        <h2>What Makes It Robust</h2>
        <div className="grid-2">
          <div>
            <div className="dcard" style={{ marginBottom: 24 }}>
              <h4><span className="green">52 Automated Tests</span></h4>
              <ul>
                <li><strong>Unit tests</strong> — Classification, extraction, validation, confidence engine</li>
                <li><strong>Integration tests</strong> — Full pipeline end-to-end with deterministic fixtures</li>
                <li><strong>Golden tests</strong> — Regression suite with expected outputs for T4, NOA, Employment Letter</li>
                <li><strong>Adversarial tests</strong> — Garbled text, missing fields, impossible values, multi-doc files</li>
              </ul>
            </div>
            <div className="dcard">
              <h4><span className="yellow">Deterministic Mode</span></h4>
              <p>Every agent has a fixture path (<code style={{ color: "#60a5fa" }}>DETERMINISTIC_MODE=true</code>) that returns predictable outputs without calling Claude. All 52 tests run in &lt;400ms with zero API costs.</p>
            </div>
          </div>
          <div>
            <div className="dcard" style={{ marginBottom: 24 }}>
              <h4><span className="purple">Append-Only Audit Trail</span></h4>
              <ul>
                <li>SHA-256 hash of every agent input</li>
                <li>SHA-256 hash of every agent output</li>
                <li>Pipeline version tracked per execution</li>
                <li>Human review overrides logged separately</li>
                <li>Nothing is ever deleted or modified</li>
              </ul>
            </div>
            <div className="dcard">
              <h4><span className="accent">Configurable Rules</span></h4>
              <p>Validation rules defined in code with YAML override support. Add new document types or change thresholds without touching agent code. Rules enforce required fields, cross-field comparisons, and range checks.</p>
            </div>
          </div>
        </div>
        <div className="slide-number">6 / 9</div>
      </div>

      {/* Slide 7: Confidence Engine */}
      <div className="slide">
        <h3>Decision Framework</h3>
        <h2>Confidence Scoring</h2>
        <div className="formula">
          score = (modelConfidence &times; 0.5) + (validationScore &times; 0.3) + (crossFieldScore &times; 0.2)
        </div>
        <div className="grid-3" style={{ marginTop: 32 }}>
          <div className="dcard" style={{ textAlign: "center" }}>
            <h4>Model Confidence <span className="tag tag-blue">50%</span></h4>
            <p>AI model{"'"}s self-assessed accuracy for classification and extraction</p>
          </div>
          <div className="dcard" style={{ textAlign: "center" }}>
            <h4>Validation Score <span className="tag tag-green">30%</span></h4>
            <p>1.0 if all rules pass, 0.5 if any error-severity rule fails</p>
          </div>
          <div className="dcard" style={{ textAlign: "center" }}>
            <h4>Cross-Field Score <span className="tag tag-yellow">20%</span></h4>
            <p>1.0 minus 0.20 per error, 0.05 per warning from rule engine</p>
          </div>
        </div>
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <p style={{ fontSize: 20 }}>
            Score <span className="green">&ge; 85%</span> &rarr; Auto-approved &nbsp;&nbsp;|&nbsp;&nbsp;
            Score <span style={{ color: "#ef4444" }}>&lt; 85%</span> &rarr; Flagged for human review
          </p>
        </div>
        <div className="slide-number">7 / 9</div>
      </div>

      {/* Slide 8: By the Numbers */}
      <div className="slide" style={{ textAlign: "center", alignItems: "center" }}>
        <h3>By the Numbers</h3>
        <h2>Project Stats</h2>
        <div className="stat-row" style={{ justifyContent: "center" }}>
          <div className="stat">
            <div className="num">56</div>
            <div className="label">Source Files</div>
          </div>
          <div className="stat">
            <div className="num">52</div>
            <div className="label">Automated Tests</div>
          </div>
          <div className="stat">
            <div className="num">5</div>
            <div className="label">Document Types</div>
          </div>
          <div className="stat">
            <div className="num">3</div>
            <div className="label">AI Agents</div>
          </div>
          <div className="stat">
            <div className="num">14</div>
            <div className="label">Validation Rules</div>
          </div>
          <div className="stat">
            <div className="num">6</div>
            <div className="label">Database Tables</div>
          </div>
        </div>
        <div style={{ marginTop: 48 }}>
          <span className="tech-badge">Claude Sonnet 4.5</span>
          <span className="tech-badge">Next.js 15</span>
          <span className="tech-badge">Prisma ORM</span>
          <span className="tech-badge">PostgreSQL (Neon)</span>
          <span className="tech-badge">TypeScript</span>
          <span className="tech-badge">Vitest</span>
          <span className="tech-badge">Vercel</span>
          <span className="tech-badge">Node.js zlib</span>
        </div>
        <div className="slide-number">8 / 9</div>
      </div>

      {/* Slide 9: Live Demo */}
      <div className="slide" style={{ textAlign: "center", justifyContent: "center", alignItems: "center" }}>
        <h3>Try It</h3>
        <h1>Live at <span className="accent">Vercel</span></h1>
        <p className="subtitle" style={{ textAlign: "center", marginTop: 12 }}>
          <a href="https://mortgage-doc-ai.vercel.app" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 28 }}>
            mortgage-doc-ai.vercel.app
          </a>
        </p>
        <p style={{ color: "#64748b", marginTop: 8, fontSize: 16 }}>
          <a href="https://github.com/sidhartharora-ops/mortgage-doc-ai" style={{ color: "#64748b", textDecoration: "none" }}>
            github.com/sidhartharora-ops/mortgage-doc-ai
          </a>
        </p>
        <div style={{ marginTop: 48, display: "flex", gap: 24, justifyContent: "center" }}>
          <div className="dcard" style={{ width: 200, textAlign: "center" }}>
            <h4>/upload</h4>
            <p>Upload a document</p>
          </div>
          <div className="dcard" style={{ width: 200, textAlign: "center" }}>
            <h4>/review</h4>
            <p>Review queue</p>
          </div>
          <div className="dcard" style={{ width: 200, textAlign: "center" }}>
            <h4>/about</h4>
            <p>System details</p>
          </div>
        </div>
        <div className="slide-number">9 / 9</div>
      </div>
    </div>
  );
}
