import { useState, useEffect } from "react";
import { CHEERS, shuffle, pick } from "../data/woorden";
import { useGameRounds } from "../hooks/useGameRounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 6;
const COLOR = "#55efc4";

// Colour rounds: the basket itself has the colour. Type rounds: the basket
// shows two examples, so the category is visible without reading.
const COLOR_BASKETS = [
  { label: "Rood", color: "#e74c3c", items: ["🍅", "🌶️", "🍓", "🍒"] },
  { label: "Groen", color: "#27ae60", items: ["🥒", "🥬", "🥦", "🍏"] },
  { label: "Oranje", color: "#f39c12", items: ["🥕", "🎃", "🍊"] },
];

const TYPE_BASKETS = [
  { label: "Fruit", color: "#8e44ad", voorbeeld: "🍌🍇", items: ["🍎", "🍐", "🍓", "🍒", "🍊"] },
  { label: "Groente", color: "#8e44ad", voorbeeld: "🥦🌽", items: ["🥕", "🥒", "🥬", "🧅", "🍆"] },
];

function roundsFor(baskets, vraag, withExample) {
  // Every basket at least once, the rest random — never a fixed pattern
  const picks = shuffle([...baskets, pick(baskets)]).slice(0, 3);
  return picks.map((basket) => ({
    item: pick(basket.items),
    correctLabel: basket.label,
    vraag,
    baskets: baskets.map((b) => ({ label: b.label, color: b.color, voorbeeld: withExample ? b.voorbeeld : null })),
    kleurMand: !withExample,
  }));
}

function generateRounds() {
  return [
    ...roundsFor(COLOR_BASKETS, "Welke kleur heeft het? Doe het in de mand met dezelfde kleur!", false),
    ...roundsFor(TYPE_BASKETS, "Is het fruit of groente? Tik op de goede mand!", true),
  ];
}

export default function OogstSorteren({ onBack, onScore }) {
  const [qs, setQs] = useState([]);
  const [sorted, setSorted] = useState(false);
  const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
    total: ROUNDS,
    onDone: onScore,
    delay: 1600,
  });

  useEffect(() => {
    setQs(generateRounds());
  }, []);

  useEffect(() => {
    setSorted(false);
  }, [round]);

  const cur = qs[round];

  const doAnswer = (label) => {
    const ok = label === cur.correctLabel;
    if (ok) setSorted(true);
    handleAnswer(
      ok,
      ok ? pick(CHEERS) : `Het hoort bij: ${cur.correctLabel}`
    );
  };

  if (!cur && !done) return null;
  if (done)
    return (
      <DoneScreen
        emoji={"\ud83e\udea3"}
        score={score}
        total={ROUNDS}
        onBack={onBack}
      />
    );

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar
        onBack={onBack}
        current={round}
        total={ROUNDS}
        score={score}
        color={COLOR}
      />

      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={S.prompt}>{cur.vraag}</p>

        {/* Item to sort */}
        <div
          style={{
            ...S.bigEmoji,
            animation: sorted ? "slideUp 0.4s ease" : "bounce 1.5s infinite",
            transition: "opacity 0.3s",
            opacity: sorted ? 0.3 : 1,
          }}
        >
          {cur.item}
        </div>

        {/* Baskets */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          {cur.baskets.map((basket) => (
            <button
              key={basket.label}
              disabled={ans}
              onClick={() => doAnswer(basket.label)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "16px 24px",
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "'Fredoka One', cursive",
                border: `3px solid ${basket.color}`,
                borderRadius: 20,
                background: cur.kleurMand ? basket.color + "33" : "#fafafa",
                cursor: "pointer",
                transition: "all 0.2s",
                color: "#2d3436",
                minWidth: 100,
                minHeight: 80,
                ...(fb && basket.label === cur.correctLabel
                  ? {
                      borderColor: basket.color,
                      background: "#d4edda",
                      transform: "scale(1.08)",
                    }
                  : {}),
                ...(fb && basket.label !== cur.correctLabel
                  ? { opacity: 0.4 }
                  : {}),
              }}
            >
              <span style={{ fontSize: 36, position: "relative" }}>
                {"\ud83e\udea3"}
                {basket.voorbeeld && (
                  <span style={{ position: "absolute", left: "50%", top: -14, transform: "translateX(-50%)", fontSize: 22, whiteSpace: "nowrap" }}>
                    {basket.voorbeeld}
                  </span>
                )}
                {cur.kleurMand && (
                  <span style={{ position: "absolute", inset: "35% 12% 8%", borderRadius: 8, background: basket.color, opacity: 0.7, mixBlendMode: "multiply" }} />
                )}
              </span>
              <span
                style={{
                  color: basket.color,
                  fontSize: 16,
                }}
              >
                {basket.label}
              </span>
            </button>
          ))}
        </div>

        {fb && (
          <div data-speak
            style={{
              ...S.fbBub,
              backgroundColor: fb.ok ? "#d4edda" : "#fff3cd",
              color: fb.ok ? "#155724" : "#856404",
            }}
          >
            {fb.t}
          </div>
        )}
      </div>
    </div>
  );
}
