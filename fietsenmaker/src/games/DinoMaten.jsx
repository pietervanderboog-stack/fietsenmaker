import { useState, useEffect } from "react";
import { DINOS, KIND, dinoLabel } from "../data/dinos";
import { CHEERS, shuffle, pick } from "../data/woorden";
import { playSound } from "../data/sounds";
import Dino from "../components/Dino";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const COLOR = "#00b894";

// Easy → hard: compare 3, compare 4, compare with yourself, then order.
const ROUND_TYPES = [
  { type: "grootste", count: 3 },
  { type: "kleinste", count: 3 },
  { type: "grootste", count: 4 },
  { type: "kleinerDanJij", count: 3 },
  { type: "volgorde", count: 3 },
  { type: "volgorde", count: 4 },
];
const ROUNDS = ROUND_TYPES.length;

const PROMPTS = {
  grootste: "Tik op de grootste dino!",
  kleinste: "Tik op de kleinste dino!",
  kleinerDanJij: "Welke dino is kleiner dan het kind?",
  volgorde: "Tik de dino's van klein naar groot!",
};

function buildRound({ type, count }) {
  let dinos;
  if (type === "kleinerDanJij") {
    const small = DINOS.filter((d) => d.px < KIND.px);
    const big = DINOS.filter((d) => d.px > KIND.px);
    dinos = [pick(small), ...shuffle(big).slice(0, count - 1)];
  } else {
    dinos = shuffle(DINOS).slice(0, count);
  }
  const bySize = [...dinos].sort((a, b) => a.px - b.px);
  const target = {
    grootste: [bySize[bySize.length - 1]],
    kleinste: [bySize[0]],
    kleinerDanJij: [bySize[0]],
    volgorde: bySize,
  }[type];
  return { type, dinos: shuffle(dinos), target };
}

export default function DinoMaten({ onBack, onScore }) {
  const [rounds] = useState(() => ROUND_TYPES.map(buildRound));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [mistake, setMistake] = useState(false);
  const [shake, setShake] = useState(null);
  const [fb, setFb] = useState(null);
  const [conf, setConf] = useState(false);
  const [done, setDone] = useState(false);

  const cur = rounds[round];

  useEffect(() => {
    setPlaced([]);
    setMistake(false);
    setFb(null);
  }, [round]);

  const finishRound = (ok) => {
    const newScore = score + (ok ? 1 : 0);
    setScore(newScore);
    playSound("correct");
    setConf(true);
    setTimeout(() => setConf(false), 1500);
    const winner = cur.target[cur.target.length - 1];
    setFb({
      ok: true,
      t: cur.type === "volgorde"
        ? `${pick(CHEERS)} Van klein naar groot!`
        : `${pick(CHEERS)} Het is ${dinoLabel(cur.type === "grootste" ? winner : cur.target[0])}.`,
    });
    setTimeout(() => {
      if (round + 1 >= ROUNDS) {
        setDone(true);
        onScore(newScore);
        playSound("win");
      } else {
        setRound((r) => r + 1);
      }
    }, 2200);
  };

  const tap = (dino) => {
    if (fb?.ok || placed.includes(dino.id)) return;
    const expected = cur.target[placed.length];
    if (dino.id === expected.id) {
      playSound("click");
      const next = [...placed, dino.id];
      setPlaced(next);
      if (next.length === cur.target.length) finishRound(!mistake);
    } else {
      playSound("wrong");
      setMistake(true);
      setShake(dino.id);
      setTimeout(() => setShake(null), 450);
      setFb({
        ok: false,
        t: cur.type === "volgorde" ? "Kijk goed: welke is nu de kleinste?" : "Kijk nog eens goed!",
      });
      // Clear so the same hint is spoken again on the next mistake
      setTimeout(() => setFb((f) => (f && !f.ok ? null : f)), 1600);
    }
  };

  if (done) return <DoneScreen emoji="🦕" score={score} total={ROUNDS} onBack={onBack} />;

  const order = (id) => placed.indexOf(id);

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />
      <div key={round} style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={{ ...S.prompt, fontSize: 20, color: "#2d3436", fontWeight: 700 }}>
          {PROMPTS[cur.type]}
        </p>

        {/* Dino field: everything stands on the same ground line, so the height is the answer */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            gap: 4,
            height: 200,
            margin: "12px -8px 0",
            padding: "0 4px",
            borderBottom: "10px solid #e2c290",
            background: "linear-gradient(180deg, #e8f8f5 0%, #d4f1e8 100%)",
            borderRadius: "16px 16px 4px 4px",
          }}
        >
          {/* The kid is the reference, not a button */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.9 }}>
            <span style={{ fontSize: KIND.px, lineHeight: 1 }}>{KIND.emoji}</span>
          </div>
          <div style={{ width: 2, alignSelf: "stretch", margin: "16px 0 0", borderLeft: "2px dashed #b2bec3" }} />

          {cur.dinos.map((d) => {
            const n = order(d.id);
            const isPlaced = n >= 0;
            return (
              <button
                key={d.id}
                onClick={() => tap(d)}
                aria-label={dinoLabel(d)}
                style={{
                  position: "relative",
                  background: isPlaced ? "rgba(0,184,148,0.15)" : "transparent",
                  border: "none",
                  borderRadius: 14,
                  cursor: "pointer",
                  minWidth: 64,
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  padding: "0 2px",
                  animation: shake === d.id ? "shake 0.4s" : "none",
                }}
              >
                <Dino dino={d} scale={cur.dinos.length > 3 ? 0.82 : 1} />
                {isPlaced && cur.type === "volgorde" && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: COLOR,
                      color: "white",
                      fontFamily: "'Fredoka One', cursive",
                      fontSize: 18,
                      lineHeight: "30px",
                      animation: "popIn 0.3s ease",
                    }}
                  >
                    {n + 1}
                  </span>
                )}
                {isPlaced && cur.type !== "volgorde" && (
                  <span style={{ position: "absolute", top: 4, left: "50%", transform: "translateX(-50%)", fontSize: 26 }}>
                    {"⭐"}
                  </span>
                )}
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
