import { useState, useEffect } from "react";
import { PLANTEN, VORMEN } from "../data/zaadjes";
import { CHEERS, shuffle, pick } from "../data/woorden";
import { useGameRounds } from "../hooks/useGameRounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 6;
const COLOR = "#81ecec";

// Fill the pattern letters with different random plants: "AAB" → 🌻🌻🍄🌻🌻 ?
function maakRonde({ patroon, lengte }) {
  const letters = [...new Set(patroon)];
  const planten = shuffle(PLANTEN);
  const kies = Object.fromEntries(letters.map((l, i) => [l, planten[i]]));
  const rij = Array.from({ length: lengte + 1 }, (_, i) => kies[patroon[i % patroon.length]]);
  return { reeks: rij.slice(0, lengte), antwoord: rij[lengte], opties: shuffle(PLANTEN) };
}

export default function ZaadjesPlanten({ onBack, onScore }) {
  const [qs, setQs] = useState([]);
  const [filled, setFilled] = useState(false);
  const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
    total: ROUNDS,
    onDone: onScore,
    delay: 1600,
  });

  useEffect(() => {
    setQs(VORMEN.slice(0, ROUNDS).map(maakRonde));
  }, []);

  useEffect(() => {
    setFilled(false);
  }, [round]);

  const cur = qs[round];

  const doAnswer = (emoji) => {
    const ok = emoji === cur.antwoord;
    if (ok) setFilled(true);
    handleAnswer(ok, ok ? pick(CHEERS) : `Het was: ${cur.antwoord}`);
  };

  if (!cur && !done) return null;
  if (done)
    return (
      <DoneScreen
        emoji={"\ud83c\udf3b"}
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
        <p data-speak style={S.prompt}>Welke plant komt hierna?</p>

        {/* Pattern row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
            margin: "16px 0 24px",
            minHeight: 60,
          }}
        >
          {cur.reeks.map((emoji, i) => (
            <span
              key={i}
              style={{
                fontSize: 36,
                animation: `popIn 0.3s ${i * 0.08}s both`,
              }}
            >
              {emoji}
            </span>
          ))}

          {/* Empty slot or filled answer */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 12,
              border: filled ? "none" : "3px dashed #bbb",
              background: filled ? "transparent" : "#f9f9f9",
              fontSize: 36,
              animation: filled ? "popIn 0.3s ease" : "none",
              transition: "all 0.2s",
            }}
          >
            {filled ? cur.antwoord : "?"}
          </span>
        </div>

        {/* Options */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {cur.opties.map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              disabled={ans}
              onClick={() => doAnswer(emoji)}
              style={{
                padding: "14px",
                fontSize: 40,
                border: "3px solid #e8e8e8",
                borderRadius: 16,
                background: "#fafafa",
                cursor: "pointer",
                transition: "all 0.2s",
                minHeight: 72,
                ...(fb && emoji === cur.antwoord
                  ? {
                      borderColor: COLOR,
                      background: "#d4edda",
                      transform: "scale(1.08)",
                    }
                  : {}),
                ...(fb && emoji !== cur.antwoord ? { opacity: 0.4 } : {}),
              }}
            >
              {emoji}
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
