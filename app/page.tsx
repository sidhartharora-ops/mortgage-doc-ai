export default function Home() {
  return (
    <div style={{ textAlign: "center", paddingTop: 80 }}>
      <h2 style={{ fontSize: 28, marginBottom: 8 }}>Mortgage Document Intelligence</h2>
      <p style={{ color: "#64748b", marginBottom: 32 }}>Upload, classify, extract, and review Canadian mortgage documents</p>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <a
          href="/upload"
          style={{ padding: "12px 24px", backgroundColor: "#2563eb", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}
        >
          Upload Document
        </a>
        <a
          href="/review"
          style={{ padding: "12px 24px", backgroundColor: "#f1f5f9", color: "#334155", borderRadius: 8, textDecoration: "none", fontWeight: 600, border: "1px solid #e2e8f0" }}
        >
          Review Queue
        </a>
      </div>
    </div>
  );
}
