import { useState, useEffect } from "react";
import { WOORDEN, CHEERS, pick, shuffle } from "../data/woorden";
import { useGameRounds } from "../hooks/useGameRounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 8;

const MARKTSPULLEN = [
  { woord: "appel",      meervoud: "appels",     emoji: "\ud83c\udf4e" },
  { woord: "peer",       meervoud: "peren",      emoji: "\ud83c\udf50" },
  { woord: "wortel",     meervoud: "wortels",    emoji: "\ud83e\udd55" },
  { woord: "banaan",     meervoud: "bananen",    emoji: "\ud83c\udf4c" },
  { woord: "tomaat",     meervoud: "tomaten",    emoji: "\ud83c\udf45" },
  { woord: "ui",         meervoud: "uien",       emoji: "\ud83e\uddc5" },
];

function buildQuestions() {
  const vehs = MARKTSPULLEN;

  return Array.from({ length: ROUNDS }, (_, i) => {
    const diff = i < 3 ? "count" : i < 6 ? "add" : "sub";
    const v = pick(vehs);

    if (diff === "count") {
      const c = 1 + Math.floor(Math.random() * 7);
      const mkWrong = (offset) => {
        const w = c + offset;
        return w === c || w < 1 ? c + 3 : w;
      };
      return {
        type: "count",
        vraag: `Tel de ${v.meervoud ?? v.woord + "en"}`,
        antwoord: c,
        opties: shuffle([c, mkWrong(1), mkWrong(-1)]),
        vis: Array.from({ length: c }, () => ({ e: v.emoji })),
      };
    }

    if (diff === "add") {
      const a = 1 + Math.floor(Math.random() * 5);
      const b = 1 + Math.floor(Math.random() * 5);
      const sum = a + b;
      const v2 = pick(vehs.filter((x) => x.woord !== v.woord));
      const mkW = (off) => {
        const w = Math.max(1, sum + off);
        return w === sum ? sum + 3 : w;
      };
      return {
        type: "add",
        vraag: `${a} + ${b} = ?`,
        antwoord: sum,
        opties: shuffle([sum, mkW(1), mkW(-1)]),
        visA: Array.from({ length: a }, () => v.emoji),
        visB: Array.from({ length: b }, () => v2.emoji),
        a, b,
      };
    }

    // sub
    const a = 4 + Math.floor(Math.random() * 6);
    const b = 1 + Math.floor(Math.random() * Math.min(a - 1, 4));
    const diff2 = a - b;
    const mkW = (off) => {
      const w = Math.max(0, diff2 + off);
      return w === diff2 ? diff2 + 2 : w;
    };
    return {
      type: "sub",
      vraag: `${a} - ${b} = ?`,
      antwoord: diff2,
      opties: shuffle([diff2, mkW(1), mkW(-1)]),
      vis: Array.from({ length: a }, (_, idx) => ({ e: v.emoji, x: idx >= a - b })),
      a, b,
    };
  });
}

export default function Rekenrace({ onBack, onScore }) {
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
    const ok = a === cur.antwoord;
    handleAnswer(ok, ok ? pick(CHEERS) : `Het antwoord was: ${cur.antwoord}`);
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83c\udfaf"} score={score} total={ROUNDS} onBack={onBack} />;

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color="#FF9F43" />
      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={S.prompt}>
          {cur.type === "count" ? "Tel de spullen op de markt!" : "Reken maar uit!"}
        </p>
        <h3
          style={{
            textAlign: "center",
            fontSize: 28,
            margin: "8px 0 16px",
            color: "#2d3436",
          }}
        >
          {cur.vraag}
        </h3>

        <div style={S.emojiGrid}>
          {cur.type === "count" &&
            cur.vis.map((v, i) => (
              <span
                key={i}
                style={{ fontSize: 36, animation: `popIn 0.3s ${i * 0.05}s both` }}
              >
                {v.e}
              </span>
            ))}

          {cur.type === "add" && (
            <>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                {cur.visA.map((e, i) => (
                  <span
                    key={`a${i}`}
                    style={{ fontSize: 36, animation: `popIn 0.3s ${i * 0.05}s both` }}
                  >
                    {e}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: 32, margin: "0 8px", color: "#FF9F43", fontWeight: 800 }}>
                +
              </span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                {cur.visB.map((e, i) => (
                  <span
                    key={`b${i}`}
                    style={{ fontSize: 36, animation: `popIn 0.3s ${(i + cur.a) * 0.05}s both` }}
                  >
                    {e}
                  </span>
                ))}
              </div>
            </>
          )}

          {cur.type === "sub" &&
            cur.vis.map((v, i) => (
              <span
                key={i}
                style={{
                  fontSize: 36,
                  animation: `popIn 0.3s ${i * 0.05}s both`,
                  opacity: v.x ? 0.25 : 1,
                  textDecoration: v.x ? "line-through" : "none",
                }}
              >
                {v.e}
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
                ...(fb && o === cur.antwoord ? S.optOk : {}),
                ...(fb && o !== cur.antwoord ? { opacity: 0.4 } : {}),
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
