import { useState, useEffect } from "react";
import { SKELETTEN } from "../data/fossielen";
import { CHEERS, shuffle, pick } from "../data/woorden";
import { playSound } from "../data/sounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const COLOR = "#b08d57";
const ROUNDS = SKELETTEN.length;
const BONE = "#ecd6a4";
const BONE_EDGE = "#8a6d3b";

// Tray preview of one bone, cropped to its own box
function BoneShape({ deel, size = 64 }) {
  const [x, y, w, h] = deel.box;
  const pad = 4;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${x - pad} ${y - pad} ${Math.max(w, h) + pad * 2} ${Math.max(w, h) + pad * 2}`}
      aria-hidden="true"
    >
      <path d={deel.d} fill={BONE} stroke={BONE_EDGE} strokeWidth="3.5" fillRule="evenodd" />
    </svg>
  );
}

export default function FossielPuzzel({ onBack, onScore }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [tray, setTray] = useState([]);
  const [placed, setPlaced] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [shake, setShake] = useState(null);
  const [fb, setFb] = useState(null);
  const [conf, setConf] = useState(false);
  const [done, setDone] = useState(false);

  const skelet = SKELETTEN[round];
  const complete = skelet && placed.length === skelet.delen.length;
  const showHint = round === 0; // first skeleton: the right slot glows

  useEffect(() => {
    if (!skelet) return;
    setTray(shuffle(skelet.delen));
    setPlaced([]);
    setSelected(null);
    setMistakes(0);
    setFb(null);
  }, [round]);

  const tapBone = (deel) => {
    if (complete) return;
    playSound("click");
    setSelected(selected?.id === deel.id ? null : deel);
  };

  const tapSlot = (deel) => {
    if (complete || placed.includes(deel.id)) return;
    if (!selected) {
      setFb({ ok: false, t: "Kies eerst een bot hieronder!" });
      setTimeout(() => setFb((f) => (f && !f.ok ? null : f)), 1600);
      return;
    }
    if (selected.id === deel.id) {
      playSound("correct");
      const next = [...placed, deel.id];
      setPlaced(next);
      setTray((t) => t.filter((d) => d.id !== deel.id));
      setSelected(null);
      if (next.length === skelet.delen.length) {
        const ok = mistakes <= 1;
        const newScore = score + (ok ? 1 : 0);
        setScore(newScore);
        setConf(true);
        setTimeout(() => setConf(false), 1500);
        setFb({ ok: true, t: `${pick(CHEERS)} De ${skelet.naam} is compleet!` });
        setTimeout(() => {
          if (round + 1 >= ROUNDS) {
            setDone(true);
            onScore(newScore);
            playSound("win");
          } else {
            setRound((r) => r + 1);
          }
        }, 2400);
      }
    } else {
      playSound("wrong");
      setMistakes((m) => m + 1);
      setShake(deel.id);
      setTimeout(() => setShake(null), 450);
      setFb({ ok: false, t: "Die vorm past daar niet. Kijk naar de stippellijn!" });
      setTimeout(() => setFb((f) => (f && !f.ok ? null : f)), 1800);
    }
  };

  if (done) return <DoneScreen emoji="🦴" score={score} total={ROUNDS} onBack={onBack} />;
  if (!skelet) return null;

  const prompt = complete
    ? `Hoera, de ${skelet.naam}!`
    : selected
      ? `Waar hoort de ${selected.label}?`
      : "Tik op een bot. Tik dan op de plek waar het past.";

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />
      <div key={round} style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <h2 style={{ ...S.gt, textAlign: "center", fontSize: 24, margin: "0 0 4px", color: COLOR }}>
          {skelet.naam}
        </h2>
        <p data-speak style={{ ...S.prompt, fontSize: 17, color: "#2d3436", fontWeight: 700 }}>
          {prompt}
        </p>

        {/* Skeleton: placed bones solid, missing bones as dashed slots */}
        <svg
          viewBox="0 0 320 200"
          style={{
            width: "100%",
            background: "linear-gradient(180deg, #fdf6e3 0%, #f3e2c0 100%)",
            borderRadius: 16,
            margin: "4px 0 12px",
            animation: complete ? "bounce 0.6s ease" : "none",
          }}
        >
          <line x1="0" y1="186" x2="320" y2="186" stroke="#dcc49a" strokeWidth="3" />
          {skelet.delen.map((deel) => {
            const isPlaced = placed.includes(deel.id);
            const glow = showHint && selected?.id === deel.id && !isPlaced;
            return (
              <path
                key={deel.id}
                d={deel.d}
                fillRule="evenodd"
                onClick={() => tapSlot(deel)}
                style={{
                  cursor: isPlaced ? "default" : "pointer",
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  animation: shake === deel.id ? "shake 0.4s" : glow ? "buildingPulse 1s infinite" : "none",
                }}
                fill={isPlaced ? BONE : glow ? "rgba(255,215,0,0.35)" : "rgba(165,138,92,0.08)"}
                stroke={isPlaced ? BONE_EDGE : "#a58a5c"}
                strokeWidth={isPlaced ? 2.5 : 2}
                strokeDasharray={isPlaced ? "none" : "6 4"}
              />
            );
          })}
        </svg>

        {/* Tray with the loose bones */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, minHeight: 84 }}>
          {tray.map((deel) => {
            const isSel = selected?.id === deel.id;
            return (
              <button
                key={deel.id}
                onClick={() => tapBone(deel)}
                aria-label={deel.label}
                style={{
                  background: isSel ? "#fff4d6" : "#faf6ee",
                  border: `3px solid ${isSel ? "#f39c12" : "#e6dccb"}`,
                  borderRadius: 16,
                  padding: 6,
                  cursor: "pointer",
                  transform: isSel ? "scale(1.1)" : "none",
                  transition: "all 0.15s",
                  boxShadow: isSel ? "0 6px 16px rgba(243,156,18,0.35)" : "none",
                }}
              >
                <BoneShape deel={deel} size={68} />
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
