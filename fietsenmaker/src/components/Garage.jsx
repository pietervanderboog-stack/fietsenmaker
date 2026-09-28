import { ACHIEVEMENTS } from "../data/achievements";
import { S } from "../styles/theme";

export default function Garage({ progress, onBack }) {
  const unlocked = new Set(progress.unlockedAchievements);
  const unlockedCount = unlocked.size;

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "16px 16px 40px",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <button style={S.backBtn} onClick={onBack}>
          {"\u2190"} Terug
        </button>
        <h2
          style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: 28,
            color: "#2d3436",
            margin: 0,
          }}
        >
          {"\ud83c\udfcb\ufe0f"} Mijn garage
        </h2>
      </div>

      <p
        style={{
          textAlign: "center",
          color: "#aaa",
          fontSize: 14,
          marginBottom: 20,
          fontWeight: 600,
        }}
      >
        {unlockedCount} van {ACHIEVEMENTS.length} medailles
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.has(a.id);
          return (
            <div
              key={a.id}
              style={{
                background: isUnlocked ? "white" : "rgba(255,255,255,0.5)",
                borderRadius: 20,
                padding: "20px 12px",
                textAlign: "center",
                boxShadow: isUnlocked ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
                border: isUnlocked ? "2px solid transparent" : "2px dashed #ddd",
                transition: "all 0.3s",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  lineHeight: 1,
                  marginBottom: 8,
                  filter: isUnlocked ? "none" : "grayscale(1) opacity(0.25)",
                }}
              >
                {a.emoji}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isUnlocked ? "#2d3436" : "#ccc",
                  fontFamily: "'Quicksand', sans-serif",
                  lineHeight: 1.3,
                }}
              >
                {isUnlocked ? a.naam : "???"}
              </div>
              {isUnlocked && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#aaa",
                    marginTop: 4,
                    lineHeight: 1.3,
                  }}
                >
                  {a.beschrijving}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
