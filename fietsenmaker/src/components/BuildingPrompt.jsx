// On touch devices the prompt moves to the right, away from the joystick
export default function BuildingPrompt({ building, onEnter, touch }) {
  if (!building) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        ...(touch ? { right: 16 } : { left: "50%", transform: "translateX(-50%)" }),
        background: "white",
        borderRadius: 20,
        padding: "14px 28px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
        textAlign: "center",
        zIndex: 20,
        animation: "popIn 0.2s ease",
        fontFamily: "'Quicksand', sans-serif",
        minWidth: touch ? 160 : 200,
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 4 }}>{building.emoji}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#2d3436", marginBottom: 10 }}>
        {building.label}
      </div>
      <button
        onClick={onEnter}
        style={{
          background: `linear-gradient(135deg, ${building.color}, ${building.roofColor})`,
          color: "white",
          border: "none",
          borderRadius: 14,
          padding: "10px 28px",
          fontSize: 17,
          fontWeight: 700,
          fontFamily: "'Quicksand', sans-serif",
          cursor: "pointer",
          boxShadow: `0 4px 0 ${building.roofColor}`,
        }}
      >
        Ga naar binnen!
      </button>
      {!touch && (
        <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>
          of druk op Enter
        </div>
      )}
    </div>
  );
}
