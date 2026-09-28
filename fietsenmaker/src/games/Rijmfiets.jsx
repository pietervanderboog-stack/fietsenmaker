import { useState, useEffect } from "react";
import { RIJMDATA } from "../data/rijmen";
import { shuffle } from "../data/woorden";
import { useGameRounds } from "../hooks/useGameRounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 8;
const COLOR = "#FF6B6B";

function buildQuestions() {
  const pool = shuffle(RIJMDATA).slice(0, ROUNDS);
  const allRhymes = RIJMDATA.map((r) => r.rijmt);

  return pool.map((item) => {
    const distractors = shuffle(allRhymes.filter((r) => r !== item.rijmt)).slice(0, 2);
    return {
      ...item,
      options: shuffle([item.rijmt, ...distractors]),
    };
  });
}

export default function Rijmfiets({ onBack, onScore }) {
  const [qs, setQs] = useState([]);
  const [hint, setHint] = useState(false);

  const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
    total: ROUNDS,
    onDone: onScore,
    delay: 1800,
  });

  useEffect(() => {
    setQs(buildQuestions());
  }, []);

  useEffect(() => {
    setHint(false);
  }, [round]);

  const cur = qs[round];

  const doAnswer = (a) => {
    const ok = a === cur.rijmt;
    handleAnswer(
      ok,
      ok
        ? `\ud83c\udfb5 ${cur.woord} rijmt op ${cur.rijmt}!`
        : `Het goede antwoord was: ${cur.rijmt}`
    );
  };

  if (!cur && !done) return null;
  if (done) {
    return <DoneScreen emoji={"\ud83c\udfb5"} score={score} total={ROUNDS} onBack={onBack} />;
  }

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />

      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak={`De zeeman zoekt een rijmwoord voor ${cur.woord}. Is het ${cur.options.slice(0, -1).join(", ")} of ${cur.options[cur.options.length - 1]}?`} style={S.prompt}>De zeeman zoekt een rijmwoord voor...</p>

        {/* Target word display */}
        <div style={{ textAlign: "center", margin: "8px 0 16px" }}>
          <div style={S.bigEmoji}>{cur.emoji}</div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              fontFamily: "'Fredoka One', cursive",
              color: "#2d3436",
              letterSpacing: 3,
              marginTop: 4,
            }}
          >
            {cur.woord}
          </div>
        </div>

        {/* Hint */}
        {!hint && !ans && (
          <button style={S.hintBtn} onClick={() => setHint(true)}>
            {"\ud83d\udc42"} Hint
          </button>
        )}
        {hint && <p data-speak={`${cur.hint}. ${cur.woord}.`} style={S.hintTxt}>{cur.hint}</p>}

        {/* Options */}
        <div style={S.opts}>
          {cur.options.map((o) => (
            <button
              key={o}
              disabled={ans}
              onClick={() => doAnswer(o)}
              style={{
                ...S.optBtn,
                ...(fb && o === cur.rijmt ? S.optOk : {}),
                ...(fb && o !== cur.rijmt ? { opacity: 0.4 } : {}),
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
