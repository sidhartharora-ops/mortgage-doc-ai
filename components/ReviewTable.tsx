"use client";

import ConfidenceBadge from "./ConfidenceBadge";

interface Field {
  id: number;
  fieldName: string;
  value: string;
  confidence: number;
  requiresReview: boolean;
}

interface ReviewTableProps {
  fields: Field[];
  documentId: string;
  onOverride?: (fieldName: string, newValue: string) => void;
}

export default function ReviewTable({ fields, documentId, onOverride }: ReviewTableProps) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
          <th style={{ padding: "8px 12px" }}>Field</th>
          <th style={{ padding: "8px 12px" }}>Value</th>
          <th style={{ padding: "8px 12px" }}>Confidence</th>
          <th style={{ padding: "8px 12px" }}>Status</th>
          <th style={{ padding: "8px 12px" }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((field) => (
          <tr key={field.id} style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: field.requiresReview ? "#fffbeb" : "#fff" }}>
            <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{field.fieldName}</td>
            <td style={{ padding: "8px 12px" }}>{field.value}</td>
            <td style={{ padding: "8px 12px" }}>
              <ConfidenceBadge confidence={field.confidence} />
            </td>
            <td style={{ padding: "8px 12px" }}>
              {field.requiresReview ? (
                <span style={{ color: "#ca8a04", fontWeight: 600, fontSize: 12 }}>Needs Review</span>
              ) : (
                <span style={{ color: "#16a34a", fontSize: 12 }}>OK</span>
              )}
            </td>
            <td style={{ padding: "8px 12px" }}>
              {field.requiresReview && onOverride && (
                <button
                  onClick={() => {
                    const newValue = prompt(`Override ${field.fieldName}:`, field.value);
                    if (newValue !== null) onOverride(field.fieldName, newValue);
                  }}
                  style={{ padding: "4px 8px", fontSize: 12, cursor: "pointer", borderRadius: 4, border: "1px solid #cbd5e1", backgroundColor: "#fff" }}
                >
                  Override
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
