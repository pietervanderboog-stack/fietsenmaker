import { memo } from "react";
import { pick } from "../data/woorden";

const COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FF9F43", "#A855F7"];

const Confetti = memo(function Confetti({ active }) {
  if (!active) return null;

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: pick(COLORS),
    size: 6 + Math.random() * 8,
    rot: Math.random() * 360,
    round: Math.random() > 0.5,
  }));

  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.round ? "50%" : "2px",
            transform: `rotate(${p.rot}deg)`,
            animation: `confettiFall 1.5s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
});

export default Confetti;
