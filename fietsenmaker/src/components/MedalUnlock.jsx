import { useEffect } from "react";
import Confetti from "./Confetti";
import { playSound } from "../data/sounds";

export default function MedalUnlock({ medals, onDismiss }) {
  const hasMedals = medals && medals.length > 0;

  // Hooks must run on every render — the early return comes after
  useEffect(() => {
    if (hasMedals) playSound("medal");
  }, [hasMedals]);

  if (!hasMedals) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
      }}
    >
      <Confetti active={true} />
      <div
        style={{
          background: "white",
          borderRadius: 28,
          padding: "36px 28px",
          maxWidth: 340,
          width: "100%",
          textAlign: "center",
          animation: "popIn 0.5s ease",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            fontSize: 15,
            color: "#aaa",
            fontWeight: 600,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {medals.length === 1 ? "Nieuwe medaille!" : `${medals.length} nieuwe medailles!`}
        </div>

        {medals.map((m, idx) => (
          <div
            key={m.id}
            style={{ marginBottom: idx < medals.length - 1 ? 24 : 0 }}
          >
            <div
              style={{
                fontSize: 80,
                lineHeight: 1.1,
                marginBottom: 8,
                animation: "bounce 1.2s ease infinite",
              }}
            >
              {m.emoji}
            </div>
            <div
              data-speak={`Nieuwe medaille: ${m.naam}!`}
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 26,
                color: "#2d3436",
                marginBottom: 4,
              }}
            >
              {m.naam}
            </div>
            <div style={{ fontSize: 15, color: "#888", lineHeight: 1.4 }}>
              {m.beschrijving}
            </div>
          </div>
        ))}

        <button
          onClick={onDismiss}
          style={{
            marginTop: 28,
            padding: "14px 36px",
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "'Quicksand', sans-serif",
            border: "none",
            borderRadius: 14,
            cursor: "pointer",
            background: "linear-gradient(135deg, #FF9F43, #e67e22)",
            color: "white",
            boxShadow: "0 4px 0 #d35400",
            width: "100%",
          }}
        >
          Hoera! {"\ud83c\udf89"}
        </button>
      </div>
    </div>
  );
}
