import { useState, useEffect } from "react";
import { DINOS, dinoLabel } from "../data/dinos";
import { CHEERS, shuffle, pick } from "../data/woorden";
import { playSound } from "../data/sounds";
import Dino from "../components/Dino";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const COLOR = "#8d6e63";
// Rounds 1-3: three dinos far apart in size; 4-6: four dinos, closer together
const ROUND_SIZES = [3, 3, 3, 4, 4, 4];
const ROUNDS = ROUND_SIZES.length;

// Three-toed dino print; size in px is proportional to the dino
function Footprint({ size, color = "#6d4c41" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <g fill={color}>
        <ellipse cx="50" cy="68" rx="22" ry="20" />
        <path d="M40 52 Q22 30 14 8 Q30 22 48 48 Z" />
        <path d="M44 50 Q48 22 50 2 Q56 22 56 50 Z" />
        <path d="M60 52 Q78 30 86 8 Q70 22 52 48 Z" />
      </g>
    </svg>
  );
}

const printSize = (d) => Math.round(20 + d.px * 0.55);

function buildRound(count) {
  // Spread sizes: pick from the sorted list with gaps for 3, any 4 for 4
  const sorted = [...DINOS].sort((a, b) => a.px - b.px);
  const picks = count === 3
    ? pick([[0, 2, 4], [1, 3, 5], [0, 2, 5], [0, 3, 5]]).map((i) => sorted[i])
    : shuffle(sorted).slice(0, 4);
  return {
    dinos: shuffle(picks),
    prints: shuffle(picks),
    order: shuffle(picks), // which dino is asked about first
  };
}

export default function VoetafdrukMatch({ onBack, onScore }) {
  const [rounds] = useState(() => ROUND_SIZES.map(buildRound));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState([]); // dino ids already on their print
  const [mistake, setMistake] = useState(false);
  const [shake, setShake] = useState(null);
  const [fb, setFb] = useState(null);
  const [conf, setConf] = useState(false);
  const [done, setDone] = useState(false);

  const cur = rounds[round];
  const asking = cur.order[matched.length];

  useEffect(() => {
    setMatched([]);
    setMistake(false);
    setFb(null);
  }, [round]);

  const tapPrint = (d) => {
    if (!asking || matched.includes(d.id)) return;
    if (d.id === asking.id) {
      playSound("click");
      const next = [...matched, d.id];
      setMatched(next);
      if (next.length === cur.order.length) {
        const ok = !mistake;
        const newScore = score + (ok ? 1 : 0);
        setScore(newScore);
        playSound("correct");
        setConf(true);
        setTimeout(() => setConf(false), 1500);
        setFb({ ok: true, t: `${pick(CHEERS)} Alle dino's staan op hun voetafdruk!` });
        setTimeout(() => {
          if (round + 1 >= ROUNDS) {
            setDone(true);
            onScore(newScore);
            playSound("win");
          } else {
            setRound((r) => r + 1);
          }
        }, 2200);
      }
    } else {
      playSound("wrong");
      setMistake(true);
      setShake(d.id);
      setTimeout(() => setShake(null), 450);
      setFb({
        ok: false,
        t: d.px > asking.px ? "Die voetafdruk is te groot!" : "Die voetafdruk is te klein!",
      });
      setTimeout(() => setFb((f) => (f && !f.ok ? null : f)), 1600);
    }
  };

  if (done) return <DoneScreen emoji="🐾" score={score} total={ROUNDS} onBack={onBack} />;

  const scale = cur.dinos.length > 3 ? 0.78 : 0.9;

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />
      <div key={round} style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p
          data-speak={asking ? `Welke voetafdruk is van ${dinoLabel(asking)}?` : ""}
          style={{ ...S.prompt, fontSize: 20, color: "#2d3436", fontWeight: 700 }}
        >
          {asking ? "Welke voetafdruk is van deze dino?" : "Klaar!"}
        </p>

        {/* Dinos standing side by side — the one we ask about jumps */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            height: 140,
            borderBottom: "8px solid #a1887f",
            margin: "8px 0 0",
          }}
        >
          {cur.dinos.map((d) => {
            const isAsked = asking?.id === d.id;
            const isDone = matched.includes(d.id);
            return (
              <div
                key={d.id}
                style={{
                  opacity: isDone ? 0.25 : 1,
                  animation: isAsked ? "bounce 0.9s infinite" : "none",
                  outline: isAsked ? `3px solid ${COLOR}` : "none",
                  outlineOffset: 4,
                  borderRadius: 12,
                  transition: "opacity 0.3s",
                }}
              >
                <Dino dino={d} scale={scale} />
              </div>
            );
          })}
        </div>

        {/* Mud with footprints */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: 8,
            padding: "18px 8px",
            background: "linear-gradient(180deg, #d7ccc8 0%, #bcaaa4 100%)",
            borderRadius: "4px 4px 16px 16px",
            minHeight: 120,
          }}
        >
          {cur.prints.map((d) => {
            const isDone = matched.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => tapPrint(d)}
                disabled={isDone}
                aria-label={`voetafdruk ${printSize(d)}`}
                style={{
                  position: "relative",
                  background: "rgba(255,255,255,0.25)",
                  border: "none",
                  borderRadius: 16,
                  minWidth: 64,
                  minHeight: 64,
                  padding: 6,
                  cursor: isDone ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: shake === d.id ? "shake 0.4s" : "none",
                }}
              >
                <Footprint size={printSize(d)} color={isDone ? "#8d6e63" : "#5d4037"} />
                {isDone && (
                  <span style={{ position: "absolute", animation: "popIn 0.3s ease" }}>
                    <Dino dino={d} scale={0.4} />
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
