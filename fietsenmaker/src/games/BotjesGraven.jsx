import { useState, useEffect } from "react";
import { CHEERS, shuffle, pick } from "../data/woorden";
import { playSound } from "../data/sounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const COLOR = "#e17055";

// Things a young palaeontologist can dig up
const FOSSIELEN = [
  { emoji: "🦖", woord: "T-Rex", zin: "een T-Rex" },
  { emoji: "🦕", woord: "langnek", zin: "een langnek" },
  { emoji: "🦴", woord: "bot", zin: "een bot" },
  { emoji: "💀", woord: "schedel", zin: "een schedel" },
  { emoji: "🦷", woord: "tand", zin: "een tand" },
  { emoji: "🥚", woord: "ei", zin: "een ei" },
  { emoji: "🐚", woord: "schelp", zin: "een schelp" },
  { emoji: "🦣", woord: "mammoet", zin: "een mammoet" },
  { emoji: "🐢", woord: "schildpad", zin: "een schildpad" },
  { emoji: "🦀", woord: "krab", zin: "een krab" },
  { emoji: "🐟", woord: "vis", zin: "een vis" },
  { emoji: "🐊", woord: "krokodil", zin: "een krokodil" },
];

// Bigger grid = smaller peek per tile. `peek` = tiles to dig before you may guess.
const LEVELS = [
  { grid: 3, peek: 2 }, { grid: 3, peek: 2 }, { grid: 3, peek: 2 },
  { grid: 4, peek: 3 }, { grid: 4, peek: 3 }, { grid: 4, peek: 3 },
];
const ROUNDS = LEVELS.length;
const FIELD = 260;

function buildRounds() {
  const answers = shuffle(FOSSIELEN).slice(0, ROUNDS);
  return answers.map((answer, i) => {
    const others = shuffle(FOSSIELEN.filter((f) => f.woord !== answer.woord)).slice(0, 2);
    return { ...LEVELS[i], answer, options: shuffle([answer, ...others]) };
  });
}

export default function BotjesGraven({ onBack, onScore }) {
  const [rounds] = useState(buildRounds);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [dug, setDug] = useState(new Set());
  const [wrong, setWrong] = useState([]);
  const [solved, setSolved] = useState(false);
  const [fb, setFb] = useState(null);
  const [conf, setConf] = useState(false);
  const [done, setDone] = useState(false);

  const cur = rounds[round];
  const tiles = cur.grid * cur.grid;
  const canGuess = dug.size >= cur.peek;

  useEffect(() => {
    setDug(new Set());
    setWrong([]);
    setSolved(false);
    setFb(null);
  }, [round]);

  const dig = (i) => {
    if (solved || dug.has(i)) return;
    playSound("click");
    setDug((d) => new Set(d).add(i));
  };

  const guess = (f) => {
    if (solved || wrong.includes(f.woord)) return;
    if (f.woord === cur.answer.woord) {
      const newScore = score + (wrong.length === 0 ? 1 : 0);
      setScore(newScore);
      setSolved(true);
      playSound("correct");
      setConf(true);
      setTimeout(() => setConf(false), 1500);
      setFb({ ok: true, t: `${pick(CHEERS)} Je vond ${cur.answer.zin}!` });
      setTimeout(() => {
        if (round + 1 >= ROUNDS) {
          setDone(true);
          onScore(newScore);
          playSound("win");
        } else {
          setRound((r) => r + 1);
        }
      }, 2400);
    } else {
      playSound("wrong");
      setWrong((w) => [...w, f.woord]);
      setFb({ ok: false, t: "Nog niet. Graaf nog een stukje!" });
      setTimeout(() => setFb((x) => (x && !x.ok ? null : x)), 1600);
    }
  };

  if (done) return <DoneScreen emoji="⛏️" score={score} total={ROUNDS} onBack={onBack} />;

  const cell = FIELD / cur.grid;

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />
      <div key={round} style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={{ ...S.prompt, fontSize: 20, color: "#2d3436", fontWeight: 700 }}>
          {canGuess ? "Wat heb je gevonden?" : "Graaf in het zand! Tik op de vakjes."}
        </p>

        {/* Dig site: the fossil lies under a grid of sand tiles */}
        <div
          style={{
            position: "relative",
            width: FIELD,
            height: FIELD,
            margin: "8px auto 16px",
            borderRadius: 18,
            overflow: "hidden",
            background: "radial-gradient(circle, #fff3e0 0%, #ffe0b2 100%)",
            boxShadow: "inset 0 4px 12px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: FIELD * 0.72,
              lineHeight: 1,
              filter: "sepia(0.35)",
              animation: solved ? "bounce 0.6s ease" : "none",
            }}
          >
            {cur.answer.emoji}
          </div>
          {Array.from({ length: tiles }, (_, i) => {
            const open = solved || dug.has(i);
            return (
              <button
                key={i}
                onClick={() => dig(i)}
                aria-label="graaf"
                style={{
                  position: "absolute",
                  left: (i % cur.grid) * cell,
                  top: Math.floor(i / cur.grid) * cell,
                  width: cell,
                  height: cell,
                  border: "2px solid #c49a6c",
                  background: "linear-gradient(135deg, #d7a86e 0%, #b9824a 100%)",
                  cursor: open ? "default" : "pointer",
                  opacity: open ? 0 : 1,
                  transform: open ? "scale(0.6) rotate(12deg)" : "none",
                  transition: "opacity 0.35s, transform 0.35s",
                  pointerEvents: open ? "none" : "auto",
                  fontSize: cell * 0.3,
                }}
              >
                {"⛏️"}
              </button>
            );
          })}
        </div>

        {/* Picture answers — word underneath for the kids who can read it */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            opacity: canGuess ? 1 : 0.35,
            pointerEvents: canGuess ? "auto" : "none",
            transition: "opacity 0.3s",
          }}
        >
          {cur.options.map((f) => {
            const isWrong = wrong.includes(f.woord);
            const isRight = solved && f.woord === cur.answer.woord;
            return (
              <button
                key={f.woord}
                onClick={() => guess(f)}
                disabled={isWrong}
                style={{
                  ...S.optBtn,
                  flex: 1,
                  padding: "10px 4px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  letterSpacing: 0,
                  opacity: isWrong ? 0.3 : 1,
                  ...(isRight ? S.optOk : {}),
                  borderColor: isRight ? S.optOk.borderColor : COLOR + "66",
                }}
              >
                <span style={{ fontSize: 44, lineHeight: 1 }}>{f.emoji}</span>
                <span style={{ fontSize: 16 }}>{f.woord}</span>
              </button>
            );
          })}
        </div>

        {fb && (
          <div
            data-speak
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
