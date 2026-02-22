interface ConfidenceBadgeProps {
  confidence: number;
  size?: "sm" | "md";
}

export default function ConfidenceBadge({ confidence, size = "sm" }: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 85 ? "#16a34a" : pct >= 70 ? "#ca8a04" : "#dc2626";
  const bg = pct >= 85 ? "#f0fdf4" : pct >= 70 ? "#fefce8" : "#fef2f2";
  const fontSize = size === "md" ? 14 : 12;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 12,
        backgroundColor: bg,
        color,
        fontSize,
        fontWeight: 600,
      }}
    >
      {pct}%
    </span>
  );
}
