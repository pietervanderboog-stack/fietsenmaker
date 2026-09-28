import { useState, useEffect } from "react";
import { GEWICHTEN } from "../data/zwaartekracht";
import { CHEERS, shuffle, pick } from "../data/woorden";
import { useGameRounds } from "../hooks/useGameRounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 8;
const COLOR = "#dfe6e9";

function buildPairs() {
  const items = GEWICHTEN;
  const pairs = [];

  // Round 1-3: obvious pairs (big weight difference)
  const easy = [
    [items[10], items[9]], // ballon vs olifant
    [items[0], items[7]],  // veer vs auto
    [items[1], items[8]],  // appel vs huis
  ];
  easy.forEach(([a, b]) => pairs.push(Math.random() > 0.5 ? [a, b] : [b, a]));

  // Round 4-6: medium pairs
  const medium = [
    [items[0], items[3]],  // veer vs steen
    [items[2], items[5]],  // boek vs fiets
    [items[4], items[7]],  // hond vs auto
  ];
  medium.forEach(([a, b]) => pairs.push(Math.random() > 0.5 ? [a, b] : [b, a]));

  // Round 7-8: close pairs
  const hard = [
    [items[1], items[2]],  // appel vs boek
    [items[5], items[6]],  // fiets vs paard
  ];
  hard.forEach(([a, b]) => pairs.push(Math.random() > 0.5 ? [a, b] : [b, a]));

  return pairs;
}

export default function ZwaartekrachtSorteer({ onBack, onScore }) {
  const [qs, setQs] = useState([]);
  const [dropIdx, setDropIdx] = useState(null);
  const [shakeIdx, setShakeIdx] = useState(null);
  const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
    total: ROUNDS,
    onDone: onScore,
    delay: 1600,
  });

  useEffect(() => {
    setQs(buildPairs());
  }, []);

  // Reset animations when round changes
  useEffect(() => {
    setDropIdx(null);
    setShakeIdx(null);
  }, [round]);

  const cur = qs[round];

  const doAnswer = (idx) => {
    if (ans) return;
    const pair = cur;
    const picked = pair[idx];
    const other = pair[1 - idx];
    const ok = picked.gewicht >= other.gewicht;

    if (ok) {
      setDropIdx(idx);
    } else {
      setShakeIdx(idx);
    }

    handleAnswer(ok, ok ? pick(CHEERS) : `${other.naam} is zwaarder!`);
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83e\udea8"} score={score} total={ROUNDS} onBack={onBack} />;

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />
      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={S.prompt}>Wat is zwaarder?</p>
        <p style={{ textAlign: "center", fontSize: 14, color: "#aaa", margin: "0 0 16px" }}>
          Tik op het zwaardere ding!
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            margin: "20px 0",
          }}
        >
          {cur.map((item, idx) => (
            <button
              key={item.naam + "-" + idx}
              disabled={ans}
              onClick={() => doAnswer(idx)}
              style={{
                width: 140,
                height: 160,
                borderRadius: 20,
                border: fb && idx === dropIdx ? "3px solid #4ECDC4" : "3px solid #e8e8e8",
                background: fb && idx === dropIdx ? "#d4edda" : "#fafafa",
                cursor: ans ? "default" : "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
                animation:
                  idx === dropIdx
                    ? "dropDown 0.6s ease-in forwards"
                    : idx === shakeIdx
                    ? "shake 0.4s"
                    : "none",
                fontFamily: "'Quicksand', sans-serif",
              }}
            >
              <span style={{ fontSize: 64, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}>
                {item.emoji}
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#2d3436",
                  fontFamily: "'Fredoka One', cursive",
                }}
              >
                {item.naam}
              </span>
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

      <style>{`
        @keyframes dropDown {
          0% { transform: translateY(0); }
          60% { transform: translateY(30px); }
          80% { transform: translateY(20px); }
          100% { transform: translateY(25px); }
        }
      `}</style>
    </div>
  );
}
