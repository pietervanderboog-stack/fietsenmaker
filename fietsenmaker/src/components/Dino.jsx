// Renders a dino from data/dinos.js at its true relative size and colour.
export default function Dino({ dino, scale = 1, style }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: dino.px * scale,
        lineHeight: 1,
        filter: `hue-rotate(${dino.hue}deg) drop-shadow(0 3px 4px rgba(0,0,0,0.15))`,
        ...style,
      }}
    >
      {dino.emoji}
    </span>
  );
}
