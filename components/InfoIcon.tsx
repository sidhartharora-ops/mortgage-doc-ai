interface InfoIconProps {
  tooltip: string;
}

export default function InfoIcon({ tooltip }: InfoIconProps) {
  return (
    <span
      title={tooltip}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        borderRadius: "50%",
        backgroundColor: "#e2e8f0",
        color: "#64748b",
        fontSize: 10,
        fontWeight: 700,
        cursor: "help",
        marginLeft: 4,
        verticalAlign: "middle",
        fontStyle: "italic",
        fontFamily: "Georgia, serif",
        lineHeight: 1,
      }}
    >
      i
    </span>
  );
}
