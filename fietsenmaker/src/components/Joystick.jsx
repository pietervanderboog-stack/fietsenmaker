import { useRef, useState } from "react";

const SIZE = 150;       // base diameter
const KNOB = 64;        // thumb diameter
const DEAD = 14;        // px from centre before anything moves
const MAX = (SIZE - KNOB) / 2;

// On-screen joystick for touch devices. Writes the same up/down/left/right
// booleans as the arrow keys into keysRef, so Player.js needs no changes.
// Diagonals work: pushing up-left sets both up and left.
export default function Joystick({ keysRef }) {
  const baseRef = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const release = () => {
    setActive(false);
    setKnob({ x: 0, y: 0 });
    keysRef.current = { up: false, down: false, left: false, right: false };
  };

  const move = (e) => {
    const r = baseRef.current.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy);
    if (dist > MAX) {
      dx = (dx / dist) * MAX;
      dy = (dy / dist) * MAX;
    }
    setKnob({ x: dx, y: dy });
    // 8 directions: an axis counts once it's at least ~40% of the push
    const k = { up: false, down: false, left: false, right: false };
    if (dist > DEAD) {
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (ax > ay * 0.4) k[dx < 0 ? "left" : "right"] = true;
      if (ay > ax * 0.4) k[dy < 0 ? "up" : "down"] = true;
    }
    keysRef.current = k;
  };

  return (
    <div
      ref={baseRef}
      aria-label="Stuur"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setActive(true);
        move(e);
      }}
      onPointerMove={(e) => active && move(e)}
      onPointerUp={release}
      onPointerCancel={release}
      style={{
        position: "absolute",
        left: 20,
        bottom: 24,
        width: SIZE,
        height: SIZE,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.28)",
        border: "4px solid rgba(255,255,255,0.7)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        touchAction: "none",
        userSelect: "none",
        zIndex: 30,
      }}
    >
      {/* Direction hints */}
      {["▲", "▼", "◀", "▶"].map((a, i) => (
        <span
          key={a}
          style={{
            position: "absolute",
            color: "rgba(255,255,255,0.85)",
            fontSize: 16,
            ...[
              { top: 6, left: "50%", transform: "translateX(-50%)" },
              { bottom: 6, left: "50%", transform: "translateX(-50%)" },
              { left: 8, top: "50%", transform: "translateY(-50%)" },
              { right: 8, top: "50%", transform: "translateY(-50%)" },
            ][i],
          }}
        >
          {a}
        </span>
      ))}
      <div
        style={{
          position: "absolute",
          left: SIZE / 2 - KNOB / 2 - 4 + knob.x,
          top: SIZE / 2 - KNOB / 2 - 4 + knob.y,
          width: KNOB,
          height: KNOB,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #ffd27a 45%, #ff9f43 100%)",
          boxShadow: "0 4px 0 #d35400, 0 6px 12px rgba(0,0,0,0.3)",
          transition: active ? "none" : "left 0.15s, top 0.15s",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
