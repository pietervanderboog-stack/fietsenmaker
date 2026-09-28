import { useState, useEffect } from "react";
import { CHEERS, shuffle, pick } from "../data/woorden";
import { useGameRounds } from "../hooks/useGameRounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 8;
const COLOR = "#00b894";

function buildQuestions() {
  return Array.from({ length: ROUNDS }, (_, i) => {
    let maxSum;
    if (i < 3) maxSum = 5;
    else if (i < 6) maxSum = 8;
    else maxSum = 10;

    const total = 3 + Math.floor(Math.random() * (maxSum - 2));
    const hebt = 1 + Math.floor(Math.random() * (total - 1));
    const nodig = total - hebt;

    const mkWrong = (offset) => {
      const w = nodig + offset;
      return w === nodig || w < 0 ? nodig + 2 : w;
    };

    return {
      total,
      hebt,
      nodig,
      opties: shuffle([nodig, mkWrong(1), mkWrong(-1), mkWrong(2)]).slice(0, 4),
    };
  });
}

export default function RaketBrandstof({ onBack, onScore }) {
  const [qs, setQs] = useState([]);
  const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
    total: ROUNDS,
    onDone: onScore,
    delay: 1800,
  });

  useEffect(() => {
    setQs(buildQuestions());
  }, []);

  const cur = qs[round];

  const doAnswer = (a) => {
    const ok = a === cur.nodig;
    handleAnswer(ok, ok ? pick(CHEERS) : `Het antwoord was: ${cur.nodig}`);
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83d\ude80"} score={score} total={ROUNDS} onBack={onBack} />;

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />
      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={S.prompt}>Help de raket tanken!</p>
        <div style={{ textAlign: "center", fontSize: 64, margin: "4px 0 8px" }}>
          {"\ud83d\ude80"}
        </div>
        <h3
          style={{
            textAlign: "center",
            fontSize: 18,
            margin: "8px 0 16px",
            color: "#2d3436",
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          De raket heeft <span style={{ color: COLOR, fontSize: 24 }}>{cur.total}</span> blikken
          nodig.
          <br />
          Je hebt er <span style={{ color: COLOR, fontSize: 24 }}>{cur.hebt}</span>. Hoeveel
          erbij?
        </h3>

        {/* Visual: fuel canisters */}
        <div style={S.emojiGrid}>
          {/* Current fuel */}
          {Array.from({ length: cur.hebt }, (_, i) => (
            <span
              key={`have-${i}`}
              style={{ fontSize: 32, animation: `popIn 0.3s ${i * 0.05}s both` }}
            >
              {"\ud83d\udee2\ufe0f"}
            </span>
          ))}
          {/* Needed fuel (dimmed) */}
          {Array.from({ length: cur.nodig }, (_, i) => (
            <span
              key={`need-${i}`}
              style={{
                fontSize: 32,
                opacity: 0.25,
                animation: `popIn 0.3s ${(cur.hebt + i) * 0.05}s both`,
              }}
            >
              {"\ud83d\udee2\ufe0f"}
            </span>
          ))}
        </div>

        <div style={S.opts}>
          {cur.opties.map((o) => (
            <button
              key={o}
              disabled={ans}
              onClick={() => doAnswer(o)}
              style={{
                ...S.optBtn,
                fontSize: 32,
                letterSpacing: 0,
                ...(fb && o === cur.nodig ? S.optOk : {}),
                ...(fb && o !== cur.nodig ? { opacity: 0.4 } : {}),
              }}
            >
              {o}
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
