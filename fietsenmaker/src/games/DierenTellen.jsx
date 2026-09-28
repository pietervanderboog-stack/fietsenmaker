import { useState, useEffect, useMemo } from "react";
import { DIEREN } from "../data/boerderijdieren";
import { CHEERS, shuffle, pick } from "../data/woorden";
import { useGameRounds } from "../hooks/useGameRounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 8;
const COLOR = "#e17055";

// Animals sit in shuffled cells of a 4×3 grid with a little jitter, so they
// never overlap (overlapping animals made some rounds impossible to count)
function freeSpots() {
  const cells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      cells.push({ left: 6 + c * 23 + Math.random() * 8, top: 8 + r * 29 + Math.random() * 10 });
    }
  }
  return shuffle(cells);
}

function generateRound(roundIdx) {
  const animals = shuffle(DIEREN);

  if (roundIdx < 3) {
    // Single type, count 3-5
    const animal = animals[0];
    const count = 3 + Math.floor(Math.random() * 3); // 3-5
    const spots = freeSpots();
    const positions = Array.from({ length: count }, () => spots.pop());
    const correct = count;
    const opts = generateOptions(correct);
    return {
      fieldAnimals: positions.map((p) => ({ ...animal, ...p })),
      targetAnimal: animal,
      correct,
      options: opts,
      question: `Hoeveel ${animal.emoji} ${animal.meervoud} zie je?`,
      isAddition: false,
    };
  } else if (roundIdx < 6) {
    // Mixed, count one specific type
    const target = animals[0];
    const other = animals[1];
    const targetCount = 2 + Math.floor(Math.random() * 3); // 2-4
    const otherCount = 2 + Math.floor(Math.random() * 3); // 2-4
    const spots = freeSpots();
    const positions = [];
    for (let i = 0; i < targetCount; i++) {
      positions.push({
        ...target,
        ...spots.pop(),
      });
    }
    for (let i = 0; i < otherCount; i++) {
      positions.push({
        ...other,
        ...spots.pop(),
      });
    }
    const opts = generateOptions(targetCount);
    return {
      fieldAnimals: shuffle(positions),
      targetAnimal: target,
      correct: targetCount,
      options: opts,
      question: `Hoeveel ${target.emoji} ${target.meervoud} zie je?`,
      isAddition: false,
    };
  } else {
    // Count two types and add
    const a1 = animals[0];
    const a2 = animals[1];
    const c1 = 2 + Math.floor(Math.random() * 2); // 2-3
    const c2 = 2 + Math.floor(Math.random() * 2); // 2-3
    const spots = freeSpots();
    const positions = [];
    for (let i = 0; i < c1; i++) {
      positions.push({
        ...a1,
        ...spots.pop(),
      });
    }
    for (let i = 0; i < c2; i++) {
      positions.push({
        ...a2,
        ...spots.pop(),
      });
    }
    const total = c1 + c2;
    const opts = generateOptions(total);
    return {
      fieldAnimals: shuffle(positions),
      targetAnimal: null,
      correct: total,
      options: opts,
      question: `Tel de ${a1.emoji} ${a1.meervoud} en de ${a2.emoji} ${a2.meervoud}. Hoeveel zijn het er samen?`,
      isAddition: true,
    };
  }
}

function generateOptions(correct) {
  const set = new Set([correct]);
  while (set.size < 4) {
    const offset = Math.floor(Math.random() * 4) - 2;
    const val = correct + (offset === 0 ? (Math.random() > 0.5 ? 3 : -1) : offset);
    if (val > 0 && val <= 12) set.add(val);
  }
  return shuffle([...set]);
}

export default function DierenTellen({ onBack, onScore }) {
  const [qs, setQs] = useState([]);
  const { round, score, fb, conf, ans, done, handleAnswer } = useGameRounds({
    total: ROUNDS,
    onDone: onScore,
    delay: 1600,
  });

  useEffect(() => {
    setQs(Array.from({ length: ROUNDS }, (_, i) => generateRound(i)));
  }, []);

  const cur = qs[round];

  const doAnswer = (num) => {
    const ok = num === cur.correct;
    handleAnswer(ok, ok ? pick(CHEERS) : `Het waren er ${cur.correct}!`);
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83d\udc04"} score={score} total={ROUNDS} onBack={onBack} />;

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />

      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={S.prompt}>{cur.question}</p>

        {/* Field */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 200,
            background: "linear-gradient(180deg, #87CEEB 0%, #90EE90 40%, #228B22 100%)",
            borderRadius: 16,
            margin: "8px 0 16px",
            overflow: "hidden",
          }}
        >
          {cur.fieldAnimals.map((a, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${a.left}%`,
                top: `${a.top}%`,
                fontSize: 28,
                filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))",
                animation: `popIn 0.3s ${i * 0.05}s both`,
              }}
            >
              {a.emoji}
            </span>
          ))}
        </div>

        {/* Number options */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {cur.options.map((num) => (
            <button
              key={num}
              disabled={ans}
              onClick={() => doAnswer(num)}
              style={{
                padding: "16px 20px",
                fontSize: 32,
                fontWeight: 700,
                fontFamily: "'Fredoka One', cursive",
                border: "3px solid #e8e8e8",
                borderRadius: 16,
                background: "#fafafa",
                cursor: "pointer",
                transition: "all 0.2s",
                color: "#2d3436",
                minHeight: 64,
                ...(fb && num === cur.correct
                  ? { borderColor: COLOR, background: "#d4edda", transform: "scale(1.05)" }
                  : {}),
                ...(fb && num !== cur.correct ? { opacity: 0.4 } : {}),
              }}
            >
              {num}
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
