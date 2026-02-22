"use client";

import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ documentId: string; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
      <div
        style={{
          border: "2px dashed #cbd5e1",
          borderRadius: 12,
          padding: 32,
          textAlign: "center",
          marginBottom: 16,
          backgroundColor: file ? "#f0fdf4" : "#fff",
        }}
      >
        <input
          type="file"
          accept=".pdf,.txt,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: 8 }}
        />
        <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
          Supported: T4, NOA, Paystub, Bank Statement, Employment Letter (PDF, TXT, image)
        </p>
      </div>

      <button
        type="submit"
        disabled={!file || uploading}
        style={{
          width: "100%",
          padding: "10px 0",
          backgroundColor: uploading ? "#94a3b8" : "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: uploading ? "wait" : "pointer",
        }}
      >
        {uploading ? "Processing..." : "Upload & Process"}
      </button>

      {error && (
        <div style={{ marginTop: 12, padding: 12, backgroundColor: "#fef2f2", color: "#dc2626", borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 12, padding: 12, backgroundColor: "#f0fdf4", borderRadius: 8, fontSize: 13 }}>
          <strong>Document processed!</strong>
          <br />
          ID: {result.documentId} — Status: {result.status}
          <br />
          <a href={`/review/${result.documentId}`} style={{ color: "#2563eb" }}>
            View details →
          </a>
        </div>
      )}
    </form>
  );
}
