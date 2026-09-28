import { memo } from "react";

const Stars = memo(function Stars({ count, max = 5 }) {
  return (
    <div
      role="img"
      aria-label={`${count} van de ${max} sterren`}
      style={{ display: "flex", gap: 4, justifyContent: "center" }}
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            fontSize: 28,
            filter: i < count ? "none" : "grayscale(1) opacity(0.3)",
            transition: "all 0.3s",
            transform: i < count ? "scale(1.1)" : "scale(0.9)",
          }}
        >
          {"\u2b50"}
        </span>
      ))}
    </div>
  );
});

export default Stars;
