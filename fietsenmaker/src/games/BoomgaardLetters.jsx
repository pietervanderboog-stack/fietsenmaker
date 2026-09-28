import { useState, useEffect } from "react";
import { VRUCHTEN } from "../data/boomgaard";
import { CHEERS, shuffle, pick } from "../data/woorden";
import { useGameRounds } from "../hooks/useGameRounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 8;
const COLOR = "#00b894";
// Lowercase, without q/x/y/c, which kids this age rarely meet as a first sound
const ALL_LETTERS = "abdefghijklmnoprstuvwz".split("");

export default function BoomgaardLetters({ onBack, onScore }) {
  const [qs, setQs] = useState([]);
  const [filled, setFilled] = useState(false);
  const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
    total: ROUNDS,
    onDone: onScore,
    delay: 1600,
  });

  useEffect(() => {
    const sel = shuffle(VRUCHTEN).slice(0, ROUNDS);
    setQs(
      sel.map((item) => {
        const correct = item.letter;
        const distractors = shuffle(
          ALL_LETTERS.filter((l) => l !== correct)
        ).slice(0, 3);
        return {
          ...item,
          options: shuffle([correct, ...distractors]),
        };
      })
    );
  }, []);

  useEffect(() => {
    setFilled(false);
  }, [round]);

  const cur = qs[round];

  const doAnswer = (letter) => {
    const ok = letter === cur.letter;
    if (ok) setFilled(true);
    handleAnswer(ok, ok ? pick(CHEERS) : `Het was: ${cur.letter}`);
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83c\udf4e"} score={score} total={ROUNDS} onBack={onBack} />;

  const blankedName = "_" + cur.naam.slice(1);

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />

      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak={`Welke letter hoort bij ${cur.naam}?`} style={S.prompt}>Welke letter hoort bij {cur.emoji}?</p>

        {/* Fruit display */}
        <div
          style={{
            ...S.bigEmoji,
            animation: filled ? "bounce 0.5s ease" : "none",
          }}
        >
          {cur.emoji}
        </div>

        {/* Word with blanked first letter */}
        <div
          style={{
            textAlign: "center",
            fontSize: 32,
            fontFamily: "'Fredoka One', cursive",
            color: "#2d3436",
            margin: "0 0 16px",
            letterSpacing: 3,
          }}
        >
          {filled ? (
            <span style={{ color: COLOR, animation: "popIn 0.3s ease" }}>
              {cur.naam}
            </span>
          ) : (
            blankedName
          )}
        </div>

        {/* Basket progress */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            margin: "0 0 16px",
          }}
        >
          <span style={{ fontSize: 28 }}>{"\ud83e\udea3"}</span>
          <div
            style={{
              width: 120,
              height: 16,
              borderRadius: 8,
              background: "#e0e0e0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${((round + (fb && fb.ok ? 1 : 0)) / ROUNDS) * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${COLOR}, #55efc4)`,
                borderRadius: 8,
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#888" }}>
            {round + (fb && fb.ok ? 1 : 0)}/{ROUNDS}
          </span>
        </div>

        {/* Letter options */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 8,
          }}
        >
          {cur.options.map((letter) => (
            <button
              key={letter}
              disabled={ans}
              onClick={() => doAnswer(letter)}
              style={{
                padding: "16px 20px",
                fontSize: 32,
                fontWeight: 700,
                fontFamily: "'Fredoka One', cursive",
                border: "3px solid #e8e8e8",
                borderRadius: 16,
                background: "#fafafa",
                cursor: "pointer",
                transition: "all 0.2s",
                color: "#2d3436",
                minHeight: 64,
                ...(fb && letter === cur.letter
                  ? { borderColor: COLOR, background: "#d4edda", transform: "scale(1.05)" }
                  : {}),
                ...(fb && letter !== cur.letter ? { opacity: 0.4 } : {}),
              }}
            >
              {letter}
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
