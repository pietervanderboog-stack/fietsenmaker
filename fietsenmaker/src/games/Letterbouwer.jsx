import { useState, useEffect } from "react";
import { WOORDEN, CHEERS, shuffle, pick } from "../data/woorden";
import { playSound } from "../data/sounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 6;

export default function Letterbouwer({ onBack, onScore }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const [conf, setConf] = useState(false);
  const [qs, setQs] = useState([]);
  const [built, setBuilt] = useState([]);
  const [avail, setAvail] = useState([]);
  const [done, setDone] = useState(false);
  const [showWord, setShowWord] = useState(false);

  useEffect(() => {
    const easy = WOORDEN.filter((w) => w.thema === "school" && w.woord.length <= 5);
    const sel = shuffle(easy).slice(0, ROUNDS);
    setQs(sel);
    if (sel.length > 0) {
      setAvail(
        shuffle(sel[0].woord.split("").map((l, i) => ({ l, id: `${l}-${i}` })))
      );
    }
  }, []);

  useEffect(() => {
    if (qs.length > 0 && round < ROUNDS) {
      const w = qs[round].woord;
      setAvail(
        shuffle(w.split("").map((l, i) => ({ l, id: `${l}-${i}-${round}` })))
      );
      setBuilt([]);
      setShowWord(false);
    }
  }, [round, qs]);

  const cur = qs[round];

  // Letter by letter: the right next letter slides into place, a wrong one
  // shakes and stays. A word counts as goed with at most one mistake.
  const [mistakes, setMistakes] = useState(0);
  const [shakeId, setShakeId] = useState(null);

  useEffect(() => {
    setMistakes(0);
  }, [round]);

  const tapLetter = (lo) => {
    if (fb?.ok) return;
    const expected = cur.woord[built.length];
    if (lo.l !== expected) {
      playSound("wrong");
      setMistakes((m) => m + 1);
      setShakeId(lo.id);
      setTimeout(() => setShakeId(null), 450);
      setFb({ ok: false, t: `Luister goed: ${cur.woord}. Welke letter komt nu?` });
      setTimeout(() => setFb((f) => (f && !f.ok ? null : f)), 1800);
      return;
    }
    playSound("click");
    const nb = [...built, lo];
    setBuilt(nb);
    setAvail((a) => a.filter((x) => x.id !== lo.id));
    if (nb.length === cur.woord.length) {
      const ok = mistakes <= 1;
      const newScore = score + (ok ? 1 : 0);
      playSound("correct");
      setFb({ ok: true, t: `${pick(CHEERS)} ${cur.woord}!` });
      setScore(newScore);
      setConf(true);
      setTimeout(() => setConf(false), 1500);
      setTimeout(() => {
        if (round + 1 >= ROUNDS) {
          setDone(true);
          onScore(newScore);
          playSound("win");
        } else {
          setRound((r) => r + 1);
          setFb(null);
        }
      }, 1800);
    }
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83d\udd24"} score={score} total={ROUNDS} onBack={onBack} />;

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color="#A855F7" />
      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak={`Spel het woord ${cur.woord}`} style={S.prompt}>Spel het woord op het schoolbord!</p>
        <div style={S.bigEmoji}>{cur.emoji}</div>
        <p style={{ textAlign: "center", color: "#aaa", fontSize: 14, fontStyle: "italic" }}>
          {cur.hint}
        </p>

        {/* Word hint */}
        {!showWord && !fb && (
          <button style={S.hintBtn} onClick={() => setShowWord(true)}>
            {"\ud83d\udca1"} Laat het woord zien
          </button>
        )}
        {showWord && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "4px 0 8px" }}>
            {cur.woord.split("").map((l, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 40,
                  borderRadius: 8,
                  background: "#f3e8ff",
                  border: "2px solid #A855F7",
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "'Fredoka One', cursive",
                  color: "#7c3aed",
                  animation: `popIn 0.2s ${i * 0.06}s both`,
                }}
              >
                {l}
              </span>
            ))}
          </div>
        )}

        {/* Letter slots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "20px 0 16px" }}>
          {cur.woord.split("").map((_, i) => (
            <div
              key={i}
              style={{
                width: 48,
                height: 56,
                borderRadius: 12,
                border: built[i]
                  ? fb && !fb.ok
                    ? "3px solid #e74c3c"
                    : fb && fb.ok
                    ? "3px solid #4ECDC4"
                    : "3px solid #A855F7"
                  : "3px dashed #ddd",
                background: built[i]
                  ? fb && !fb.ok
                    ? "#fdeaea"
                    : fb && fb.ok
                    ? "#d4edda"
                    : "#f3e8ff"
                  : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                fontFamily: "'Fredoka One', cursive",
                color: "#2d3436",
                transition: "all 0.2s",
                cursor: "pointer",
                textTransform: "lowercase",
                animation: "none",
              }}
            >
              {built[i]?.l || ""}
            </div>
          ))}
        </div>

        {/* Available letters */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          {avail.map((lo) => (
            <button
              key={lo.id}
              onClick={() => tapLetter(lo)}
              style={{
                width: 48,
                height: 56,
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(180deg, #A855F7 0%, #7c3aed 100%)",
                color: "white",
                fontSize: 26,
                fontWeight: 700,
                fontFamily: "'Fredoka One', cursive",
                cursor: "pointer",
                boxShadow: "0 4px 0 #5b21b6",
                transition: "all 0.15s",
                textTransform: "lowercase",
                animation: shakeId === lo.id ? "shake 0.4s" : "none",
              }}
            >
              {lo.l}
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
