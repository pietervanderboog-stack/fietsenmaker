import { useState, useEffect } from "react";
import { PLANETEN } from "../data/planeten";
import { CHEERS, OOPS, shuffle, pick } from "../data/woorden";
import { playSound } from "../data/sounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 6;
const COLOR = "#e17055";

function buildRounds() {
  const rounds = [];

  // Round 1-3: sort 3 planets by size (groot → klein)
  for (let i = 0; i < 3; i++) {
    const pool = shuffle([...PLANETEN]).slice(0, 3);
    const sorted = [...pool].sort((a, b) => b.grootte - a.grootte);
    rounds.push({
      type: "grootte",
      label: "Sorteer van groot naar klein!",
      planeten: shuffle(pool),
      correct: sorted,
    });
  }

  // Round 4-6: sort 4 planets klein → groot. (Distance rounds were dropped:
  // shuffled buttons give no visual cue, so they only tested memory.)
  for (let i = 0; i < 3; i++) {
    const pool = shuffle([...PLANETEN]).slice(0, 4);
    const sorted = [...pool].sort((a, b) => a.grootte - b.grootte);
    rounds.push({
      type: "klein",
      label: "Sorteer van klein naar groot!",
      planeten: shuffle(pool),
      correct: sorted,
    });
  }

  return rounds;
}

export default function PlanetenPad({ onBack, onScore }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [qs, setQs] = useState([]);
  const [placed, setPlaced] = useState([]);
  const [wobbleId, setWobbleId] = useState(null);
  const [fb, setFb] = useState(null);
  const [conf, setConf] = useState(false);
  const [done, setDone] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);

  useEffect(() => {
    setQs(buildRounds());
  }, []);

  useEffect(() => {
    setPlaced([]);
    setWobbleId(null);
    setFb(null);
    setRoundComplete(false);
  }, [round]);

  const cur = qs[round];

  const tapPlanet = (planet) => {
    if (roundComplete || fb) return;
    if (placed.find((p) => p.naam === planet.naam)) return;

    const nextIdx = placed.length;
    const correct = cur.correct;

    if (planet.naam === correct[nextIdx].naam) {
      playSound("click");
      const newPlaced = [...placed, planet];
      setPlaced(newPlaced);

      if (newPlaced.length === correct.length) {
        // Round complete
        playSound("correct");
        setRoundComplete(true);
        setConf(true);
        setFb({ ok: true, t: pick(CHEERS) });
        setScore((s) => s + 1);
        setTimeout(() => setConf(false), 1500);

        setTimeout(() => {
          if (round + 1 >= ROUNDS) {
            setDone(true);
            onScore(score + 1);
            playSound("win");
          } else {
            setRound((r) => r + 1);
          }
        }, 1600);
      }
    } else {
      playSound("wrong");
      setWobbleId(planet.naam);
      setFb({ ok: false, t: pick(OOPS) });
      setTimeout(() => {
        setWobbleId(null);
        setFb(null);
      }, 1000);
    }
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83e\ude90"} score={score} total={ROUNDS} onBack={onBack} />;

  const placedNames = placed.map((p) => p.naam);

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />
      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={S.prompt}>{cur.label}</p>
        <p style={{ textAlign: "center", fontSize: 14, color: "#aaa", margin: "0 0 12px" }}>
          {cur.type === "grootte"
            ? "Tik eerst de grootste planeet"
            : "Tik eerst de kleinste planeet"}
        </p>

        {/* Placed row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            margin: "12px 0 20px",
            minHeight: 80,
            alignItems: "center",
          }}
        >
          {cur.correct.map((_, idx) => {
            const p = placed[idx];
            return (
              <div
                key={idx}
                style={{
                  width: 64,
                  height: 72,
                  borderRadius: 16,
                  border: p ? "3px solid #e17055" : "3px dashed #ddd",
                  background: p ? "#ffeaa7" : "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s",
                  animation: p && roundComplete ? "buildingPulse 0.8s ease" : "none",
                }}
              >
                {p && (
                  <>
                    <span style={{ fontSize: 32, animation: "popIn 0.3s ease" }}>{p.emoji}</span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#2d3436",
                        fontFamily: "'Fredoka One', cursive",
                      }}
                    >
                      {p.naam}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Available planets */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          {cur.planeten.map((planet) => {
            const isPlaced = placedNames.includes(planet.naam);
            const isWobble = wobbleId === planet.naam;
            return (
              <button
                key={planet.naam}
                disabled={isPlaced || roundComplete}
                onClick={() => tapPlanet(planet)}
                style={{
                  width: 80,
                  height: 90,
                  borderRadius: 16,
                  border: "none",
                  background: isPlaced
                    ? "#f0f0f0"
                    : "linear-gradient(180deg, #e17055 0%, #d35400 100%)",
                  color: isPlaced ? "#ccc" : "white",
                  cursor: isPlaced || roundComplete ? "default" : "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  boxShadow: isPlaced ? "none" : "0 4px 0 #c0392b",
                  transition: "all 0.15s",
                  opacity: isPlaced ? 0.4 : 1,
                  animation: isWobble ? "shake 0.4s" : "none",
                  fontFamily: "'Quicksand', sans-serif",
                }}
              >
                {/* Drawn to scale, so the size is visible */}
                <span style={{ fontSize: 16 + planet.grootte * 6, lineHeight: 1 }}>{planet.emoji}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'Fredoka One', cursive",
                  }}
                >
                  {planet.naam}
                </span>
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
