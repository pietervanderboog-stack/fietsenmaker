import { useState, useEffect } from "react";
import { WOORDEN, CHEERS, shuffle, pick, pickN } from "../data/woorden";
import { useGameRounds } from "../hooks/useGameRounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 8;

export default function Woordenwiel({ onBack, onScore }) {
  const [qs, setQs] = useState([]);
  const [hint, setHint] = useState(false);
  const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
    total: ROUNDS,
    onDone: onScore,
    delay: 1600,
  });

  useEffect(() => {
    const pool = WOORDEN.filter((w) => w.thema === "station");
    const sel = shuffle(pool).slice(0, ROUNDS);
    const allWords = pool.map((w) => w.woord);
    setQs(
      sel.map((item) => ({
        ...item,
        options: shuffle([
          item.woord,
          ...pickN(allWords, 2, [item.woord]),
        ]),
      }))
    );
  }, []);

  // Reset hint when round advances
  useEffect(() => {
    setHint(false);
  }, [round]);

  const cur = qs[round];

  const doAnswer = (a) => {
    const ok = a === cur.woord;
    handleAnswer(ok, ok ? pick(CHEERS) : `Het was: ${cur.woord}`);
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83c\udfc6"} score={score} total={ROUNDS} onBack={onBack} />;

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color="#45B7D1" />
      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={S.prompt}>Welk woord hoort bij het plaatje?</p>
        <div style={S.bigEmoji}>{cur.emoji}</div>

        {!hint && !ans && (
          <button
            style={S.hintBtn}
            onClick={() => setHint(true)}
          >
            {"\ud83d\udca1"} Hint
          </button>
        )}
        {hint && <p style={S.hintTxt}>{cur.hint}</p>}

        <div style={S.opts}>
          {cur.options.map((o) => (
            <button
              key={o}
              disabled={ans}
              onClick={() => doAnswer(o)}
              style={{
                ...S.optBtn,
                ...(fb && o === cur.woord ? S.optOk : {}),
                ...(fb && o !== cur.woord ? { opacity: 0.4 } : {}),
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
