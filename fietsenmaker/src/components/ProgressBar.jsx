export default function ProgressBar({ current, total, color = "#4ECDC4" }) {
  return (
    <div
      style={{
        flex: 1,
        height: 14,
        borderRadius: 7,
        backgroundColor: "rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 7,
          width: `${(current / total) * 100}%`,
          backgroundColor: color,
          transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </div>
  );
}
