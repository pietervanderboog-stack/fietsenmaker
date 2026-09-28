import { useState, useEffect } from "react";
import { CHEERS, shuffle, pick, pickN } from "../data/woorden";
import { useGameRounds } from "../hooks/useGameRounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

// indicator = the sign shown next to the baby; never the answer itself
const NEEDS = [
  { need: "honger", zin: "heeft honger", babyEmoji: "😢", indicator: "🍽️", answer: "🍼", answerLabel: "Flesje", nodig: "een flesje" },
  { need: "koud", zin: "heeft het koud", babyEmoji: "🥶", indicator: "❄️", answer: "🧥", answerLabel: "Kleren", nodig: "warme kleren" },
  { need: "moe", zin: "is moe", babyEmoji: "😴", indicator: "💤", answer: "🛏️", answerLabel: "Bedje", nodig: "een bedje" },
  { need: "vies", zin: "is vies", babyEmoji: "😣", indicator: "💩", answer: "🛁", answerLabel: "Badje", nodig: "een badje" },
  { need: "spelen", zin: "wil spelen", babyEmoji: "🥺", indicator: "🎈", answer: "🧸", answerLabel: "Speelgoed", nodig: "speelgoed" },
  { need: "ziek", zin: "is ziek", babyEmoji: "🤒", indicator: "🤧", answer: "💊", answerLabel: "Medicijn", nodig: "een medicijn" },
];

const ALL_ITEMS = NEEDS.map((n) => ({ emoji: n.answer, label: n.answerLabel }));
const ROUNDS = 8;
const COLOR = "#fd79a8";

export default function BabyVerzorgen({ onBack, onScore }) {
  const [qs, setQs] = useState([]);
  const [babyHappy, setBabyHappy] = useState(false);
  const [babyShake, setBabyShake] = useState(false);
  const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
    total: ROUNDS,
    onDone: onScore,
    delay: 1800,
  });

  useEffect(() => {
    // Pick 8 rounds from the 6 needs (some repeat)
    const pool = shuffle([...NEEDS, ...shuffle(NEEDS).slice(0, 2)]);
    const allAnswers = NEEDS.map((n) => n.answer);
    setQs(
      pool.map((item) => ({
        ...item,
        options: shuffle([
          { emoji: item.answer, label: item.answerLabel },
          ...pickN(
            ALL_ITEMS.filter((x) => x.emoji !== item.answer),
            3
          ),
        ]),
      }))
    );
  }, []);

  useEffect(() => {
    setBabyHappy(false);
    setBabyShake(false);
  }, [round]);

  const cur = qs[round];

  const doAnswer = (opt) => {
    const ok = opt.emoji === cur.answer;
    if (ok) {
      setBabyHappy(true);
    } else {
      setBabyShake(true);
      setTimeout(() => setBabyShake(false), 500);
    }
    handleAnswer(ok, ok ? pick(CHEERS) : `De baby had ${cur.nodig} nodig!`);
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83d\udc76"} score={score} total={ROUNDS} onBack={onBack} />;

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />

      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak={`De baby ${cur.zin}. Wat heeft de baby nodig?`} style={S.prompt}>Wat heeft de baby nodig?</p>

        {/* Baby display */}
        <div
          style={{
            textAlign: "center",
            margin: "8px 0 16px",
            animation: babyHappy
              ? "bounce 0.5s ease"
              : babyShake
              ? "shake 0.4s"
              : "none",
          }}
        >
          <div style={{ fontSize: 80, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}>
            {babyHappy ? "\ud83d\ude0a" : cur.babyEmoji}
          </div>
          {!babyHappy && (
            <div
              style={{
                fontSize: 40,
                marginTop: -8,
                animation: "bounce 1.5s infinite",
              }}
            >
              {cur.indicator}
            </div>
          )}
          {babyHappy && (
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#27ae60",
                fontFamily: "'Fredoka One', cursive",
                marginTop: 4,
                animation: "popIn 0.3s ease",
              }}
            >
              De baby is blij!
            </div>
          )}
        </div>

        {/* Answer options - 2x2 grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 8,
          }}
        >
          {cur.options.map((opt, i) => {
            const isCorrect = opt.emoji === cur.answer;
            return (
              <button
                key={`${opt.emoji}-${i}`}
                disabled={ans}
                onClick={() => doAnswer(opt)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "16px 8px",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'Quicksand', sans-serif",
                  border: fb && isCorrect
                    ? "3px solid #27ae60"
                    : `3px solid ${COLOR}44`,
                  borderRadius: 16,
                  background: fb && isCorrect
                    ? "#d5f5e3"
                    : fb && !isCorrect
                    ? "rgba(255,255,255,0.5)"
                    : "#fff0f6",
                  cursor: ans ? "default" : "pointer",
                  transition: "all 0.2s",
                  opacity: fb && !isCorrect ? 0.4 : 1,
                  color: "#2d3436",
                  minHeight: 48,
                }}
              >
                <span style={{ fontSize: 40 }}>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
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
