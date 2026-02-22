import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mortgage Doc AI",
  description: "Canadian mortgage document intelligence system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#f8f9fa" }}>
        <nav style={{ backgroundColor: "#1a1a2e", color: "#fff", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Mortgage Doc AI</h1>
          <a href="/upload" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14 }}>Upload</a>
          <a href="/review" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14 }}>Review Queue</a>
          <a href="/about" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14 }}>About</a>
        </nav>
        <div style={{ backgroundColor: "#fef3c7", borderBottom: "1px solid #f59e0b", padding: "8px 24px", textAlign: "center", fontSize: 13, color: "#92400e" }}>
          This is a test application. Do not upload real personal or financial documents.
        </div>
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
