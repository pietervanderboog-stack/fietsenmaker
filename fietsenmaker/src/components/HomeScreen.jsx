import { playSound } from "../data/sounds";

const GAMES = [
  {
    id: "woorden",
    title: "Woordenwiel",
    sub: "Lees het woord bij het plaatje",
    emoji: "\ud83d\udcd6",
    bg: "linear-gradient(135deg, #45B7D1, #2980b9)",
  },
  {
    id: "rekenen",
    title: "Rekenrace",
    sub: "Tel en reken met voertuigen",
    emoji: "\ud83d\udd22",
    bg: "linear-gradient(135deg, #FF9F43, #e67e22)",
  },
  {
    id: "letters",
    title: "Letterbouwer",
    sub: "Spel het woord letter voor letter",
    emoji: "\ud83d\udd24",
    bg: "linear-gradient(135deg, #A855F7, #7c3aed)",
  },
  {
    id: "rijmen",
    title: "Rijmfiets",
    sub: "Welk woord rijmt?",
    emoji: "\ud83c\udfb5",
    bg: "linear-gradient(135deg, #FF6B6B, #ee5a24)",
  },
  {
    id: "kleuren",
    title: "Kleurenmixer",
    sub: "Meng twee kleuren voor de fiets",
    emoji: "\ud83c\udfa8",
    bg: "linear-gradient(135deg, #a29bfe, #6c5ce7)",
  },
  {
    id: "vormen",
    title: "Vormenrit",
    sub: "Herken vormen in voertuigen",
    emoji: "\ud83d\udd37",
    bg: "linear-gradient(135deg, #55efc4, #00b894)",
  },
];

export default function HomeScreen({ onSelect, onGarage, progress, totalStars, todayPlayed }) {
  const streak = progress?.streak ?? 0;

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "20px 16px 40px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", padding: "24px 0 20px" }}>
        <div
          style={{
            fontSize: 80,
            animation: "bounce 2s infinite",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
          }}
        >
          {"\ud83d\udeb2"}
        </div>
        <h1
          style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: 42,
            margin: "8px 0 4px",
            background: "linear-gradient(135deg, #e67e22, #e74c3c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Fietsenmaker
        </h1>
        <p style={{ fontSize: 18, color: "#888", margin: 0, fontWeight: 600 }}>
          Leer, bouw en reken!
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {totalStars > 0 && (
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#e67e22",
                background: "rgba(255,255,255,0.8)",
                padding: "6px 14px",
                borderRadius: 20,
              }}
            >
              {"\u2b50"} {totalStars} sterren
            </div>
          )}
          {streak >= 2 && (
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#e74c3c",
                background: "rgba(255,255,255,0.8)",
                padding: "6px 14px",
                borderRadius: 20,
              }}
            >
              {"\ud83d\udd25"} {streak} dagen op rij
            </div>
          )}
          {todayPlayed && (
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#27ae60",
                background: "rgba(255,255,255,0.8)",
                padding: "6px 14px",
                borderRadius: 20,
              }}
            >
              {"\u2705"} Vandaag gespeeld
            </div>
          )}
        </div>
      </div>

      {/* Game list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {GAMES.map((g, i) => {
          const gameProgress = progress?.games?.[g.id];
          const gameStars = gameProgress?.totalStars ?? 0;
          const bestScore = gameProgress?.bestScore ?? 0;

          return (
            <button
              key={g.id}
              onClick={() => {
                playSound("click");
                onSelect(g.id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "white",
                border: "none",
                borderRadius: 20,
                padding: 16,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                transition: "transform 0.2s",
                textAlign: "left",
                fontFamily: "'Quicksand', sans-serif",
                animation: `slideUp 0.5s ${i * 0.1}s both`,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: g.bg,
                }}
              >
                <span style={{ fontSize: 44 }}>{g.emoji}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 700, color: "#2d3436" }}>
                  {g.title}
                </h3>
                <p style={{ margin: "0 0 4px", fontSize: 14, color: "#888", fontWeight: 500 }}>
                  {g.sub}
                </p>
                {gameStars > 0 && (
                  <div style={{ fontSize: 13, color: "#e67e22", fontWeight: 700 }}>
                    {"\u2b50"} {gameStars} sterren
                    {bestScore > 0 && (
                      <span style={{ color: "#bbb", fontWeight: 500 }}>
                        {" "}· best: {bestScore}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 24, color: "#ccc", fontWeight: 700 }}>{"\u2192"}</div>
            </button>
          );
        })}

        {/* Garage button */}
        <button
          onClick={() => {
            playSound("click");
            onGarage();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "rgba(255,255,255,0.6)",
            border: "2px dashed #ddd",
            borderRadius: 20,
            padding: 16,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "'Quicksand', sans-serif",
            animation: "slideUp 0.5s 0.3s both",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background: "linear-gradient(135deg, #636e72, #2d3436)",
            }}
          >
            <span style={{ fontSize: 44 }}>{"\ud83c\udfc5"}</span>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 700, color: "#2d3436" }}>
              Mijn garage
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: "#888", fontWeight: 500 }}>
              Bekijk je medailles
            </p>
          </div>
          <div style={{ fontSize: 24, color: "#ccc", fontWeight: 700 }}>{"\u2192"}</div>
        </button>
      </div>

      {/* Driving bike decoration */}
      <div
        style={{
          position: "relative",
          height: 60,
          marginTop: "auto",
          paddingTop: 20,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontSize: 28,
            position: "absolute",
            bottom: 16,
            animation: "drive 4s linear infinite",
          }}
        >
          {"\ud83d\udeb2"}
        </span>
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 0,
            right: 0,
            height: 6,
            background: "#ddd",
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
}
