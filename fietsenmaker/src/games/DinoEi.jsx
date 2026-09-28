import { useState, useEffect } from "react";
import { REEKSEN } from "../data/dinoeieren";
import { CHEERS, shuffle, pick } from "../data/woorden";
import { useGameRounds } from "../hooks/useGameRounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 6;
const COLOR = "#fdcb6e";

const EGG_STAGES = ["🥚", "🥚", "🥚", "🥚", "🐣", "🐣"];

// The egg hatches at the same score the done screen calls "uitgekomen"
const HATCH_AT = 4;
const isPicture = (v) => /\p{Extended_Pictographic}/u.test(String(v));

function EggDisplay({ crackLevel }) {
  // crackLevel: 0-6 (number of correct answers so far)
  const cracks = Math.min(crackLevel, 6);
  const hatched = cracks >= HATCH_AT;
  const emoji = hatched ? "🐣" : "🥚";

  return (
    <div
      style={{
        textAlign: "center",
        fontSize: 80,
        margin: "8px 0 4px",
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
        position: "relative",
        animation: hatched ? "bounce 0.6s" : "none",
      }}
    >
      {emoji}
      {!hatched && cracks > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 24,
            opacity: 0.7,
          }}
        >
          {Array.from({ length: Math.min(cracks, 4) }, (_, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                transform: `rotate(${i * 90 + 45}deg) translateY(-8px)`,
              }}
            >
              ⚡
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DinoEi({ onBack, onScore }) {
  const [qs, setQs] = useState([]);
  const [shuffledOpts, setShuffledOpts] = useState([]);
  const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
    total: ROUNDS,
    onDone: onScore,
    delay: 1800,
  });

  useEffect(() => {
    // Two of each level, easy → hard
    const selected = ["makkelijk", "middel", "moeilijk"].flatMap((lvl) =>
      shuffle(REEKSEN[lvl]).slice(0, ROUNDS / 3)
    );
    setQs(selected);
  }, []);

  useEffect(() => {
    if (qs[round]) {
      setShuffledOpts(shuffle([...qs[round].opties]));
    }
  }, [round, qs]);

  const cur = qs[round];

  const doAnswer = (val) => {
    const ok = String(val) === String(cur.antwoord);
    handleAnswer(ok, ok ? pick(CHEERS) : `Het was: ${cur.antwoord}`);
  };

  if (!cur && !done) return null;
  if (done) {
    const hatched = score >= HATCH_AT;
    return (
      <DoneScreen
        emoji={hatched ? "🦖" : "🥚"}
        score={score}
        total={ROUNDS}
        onBack={onBack}
      />
    );
  }

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar
        onBack={onBack}
        current={round}
        total={ROUNDS}
        score={score}
        color={COLOR}
      />
      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p
          data-speak={isPicture(cur.antwoord) ? "Wat komt hierna?" : `${cur.reeks.join(", ")}. Wat komt hierna?`}
          style={S.prompt}
        >
          Wat komt hierna?
        </p>

        <EggDisplay crackLevel={score} />

        {/* Sequence display */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            margin: "12px 0 20px",
            flexWrap: "wrap",
          }}
        >
          {cur.reeks.map((val, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 52,
                borderRadius: 12,
                background: "#fef9e7",
                border: "3px solid #fdcb6e",
                fontSize: 24,
                fontWeight: 700,
                fontFamily: "'Fredoka One', cursive",
                color: "#2d3436",
                animation: `popIn 0.2s ${i * 0.1}s both`,
              }}
            >
              {val}
            </span>
          ))}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 52,
              borderRadius: 12,
              background: "rgba(253,203,110,0.15)",
              border: "3px dashed #fdcb6e",
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "'Fredoka One', cursive",
              color: "#fdcb6e",
              animation: `popIn 0.2s ${cur.reeks.length * 0.1}s both`,
            }}
          >
            ?
          </span>
        </div>

        {/* Options */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {shuffledOpts.map((o, i) => (
            <button
              key={i}
              disabled={ans}
              onClick={() => doAnswer(o)}
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                border:
                  fb && String(o) === String(cur.antwoord)
                    ? "3px solid #4ECDC4"
                    : "3px solid #f0e6c0",
                background:
                  fb && String(o) === String(cur.antwoord)
                    ? "#d4edda"
                    : fb
                    ? "rgba(240,230,192,0.3)"
                    : "linear-gradient(180deg, #fef9e7 0%, #fdebd0 100%)",
                fontSize: 24,
                fontWeight: 700,
                fontFamily: "'Fredoka One', cursive",
                color: "#2d3436",
                cursor: "pointer",
                transition: "all 0.2s",
                opacity: fb && String(o) !== String(cur.antwoord) ? 0.4 : 1,
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
