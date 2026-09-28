import { useState, useEffect } from "react";
import { CHEERS, pick } from "../data/woorden";
import { playSound } from "../data/sounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const ROUNDS = 6;
const COLOR = "#fdcb6e";

// 3 → 8 stars. Names are counts: the random layout doesn't draw a real
// constellation shape, so a name like "De Draak" promised something it wasn't.
const STERRENBEELDEN = [3, 4, 5, 6, 7, 8].map((n) => ({ naam: `${n} sterren`, starCount: n }));

// Fixed background stars — random positions per render made them jump on every tap
const BG_STARS = Array.from({ length: 20 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 29) % 100,
  opacity: 0.3 + ((i * 7) % 5) / 10,
}));

function generateStarPositions(count) {
  const positions = [];
  const minDist = 52; // leaves room for 8 stars
  const padding = 40;
  const width = 300;
  const height = 240;

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let x, y;
    do {
      x = padding + Math.random() * (width - 2 * padding);
      y = padding + Math.random() * (height - 2 * padding);
      attempts++;
    } while (
      attempts < 100 &&
      positions.some((p) => Math.hypot(p.x - x, p.y - y) < minDist)
    );
    positions.push({ x, y, num: i + 1 });
  }
  return positions;
}

function buildConstellations() {
  return STERRENBEELDEN.map((sb) => ({
    naam: sb.naam,
    stars: generateStarPositions(sb.starCount),
  }));
}

export default function SterrenVangen({ onBack, onScore }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [constellations, setConstellations] = useState([]);
  const [connected, setConnected] = useState([]);
  const [wobbleNum, setWobbleNum] = useState(null);
  const [fb, setFb] = useState(null);
  const [conf, setConf] = useState(false);
  const [done, setDone] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);

  useEffect(() => {
    setConstellations(buildConstellations());
  }, []);

  useEffect(() => {
    setConnected([]);
    setWobbleNum(null);
    setFb(null);
    setRoundComplete(false);
  }, [round]);

  const cur = constellations[round];

  const tapStar = (star) => {
    if (roundComplete || fb) return;

    const nextNum = connected.length + 1;

    if (star.num === nextNum) {
      playSound("click");
      const newConnected = [...connected, star];
      setConnected(newConnected);

      if (newConnected.length === cur.stars.length) {
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
        }, 1800);
      }
    } else {
      playSound("wrong");
      setWobbleNum(star.num);
      setTimeout(() => setWobbleNum(null), 500);
    }
  };

  if (!cur && !done) return null;
  if (done) return <DoneScreen emoji={"\u2b50"} score={score} total={ROUNDS} onBack={onBack} />;

  const connectedNums = connected.map((s) => s.num);

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />
      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={S.prompt}>Verbind de sterren op volgorde!</p>
        <p style={{ textAlign: "center", fontSize: 14, color: "#aaa", margin: "0 0 8px" }}>
          Tik op ster {connected.length + 1 <= cur.stars.length ? connected.length + 1 : ""}
        </p>

        {/* Star field */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 320,
            height: 260,
            margin: "0 auto 12px",
            background: "linear-gradient(180deg, #2d3436 0%, #1a1a2e 100%)",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {/* Background twinkle stars */}
          {BG_STARS.map((b, i) => (
            <div
              key={`bg-${i}`}
              style={{
                position: "absolute",
                left: `${b.left}%`,
                top: `${b.top}%`,
                width: 2,
                height: 2,
                borderRadius: "50%",
                background: "white",
                opacity: b.opacity,
              }}
            />
          ))}

          {/* Lines between connected stars */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            {connected.map((star, i) => {
              if (i === 0) return null;
              const prev = connected[i - 1];
              return (
                <line
                  key={`line-${i}`}
                  x1={prev.x}
                  y1={prev.y}
                  x2={star.x}
                  y2={star.y}
                  stroke={roundComplete ? "#fdcb6e" : "#ffffff"}
                  strokeWidth={roundComplete ? 3 : 2}
                  strokeLinecap="round"
                  opacity={roundComplete ? 1 : 0.7}
                />
              );
            })}
          </svg>

          {/* Stars */}
          {cur.stars.map((star) => {
            const isConnected = connectedNums.includes(star.num);
            const isWobble = wobbleNum === star.num;
            const isNext = star.num === connected.length + 1;
            return (
              <button
                key={star.num}
                onClick={() => tapStar(star)}
                disabled={isConnected || roundComplete}
                style={{
                  position: "absolute",
                  left: star.x - 20,
                  top: star.y - 20,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: isConnected
                    ? "2px solid #fdcb6e"
                    : isNext
                    ? "2px solid rgba(253,203,110,0.6)"
                    : "2px solid rgba(255,255,255,0.3)",
                  background: isConnected
                    ? roundComplete
                      ? "radial-gradient(circle, #fdcb6e, #e67e22)"
                      : "#fdcb6e"
                    : "rgba(255,255,255,0.15)",
                  color: isConnected ? "#2d3436" : "#fff",
                  fontSize: 14,
                  fontWeight: 800,
                  fontFamily: "'Fredoka One', cursive",
                  cursor: isConnected || roundComplete ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  animation: isWobble
                    ? "shake 0.4s"
                    : roundComplete && isConnected
                    ? "buildingPulse 0.8s ease infinite"
                    : isNext && !isConnected
                    ? "bounce 1.5s infinite"
                    : "none",
                  boxShadow: isConnected
                    ? "0 0 12px rgba(253,203,110,0.6)"
                    : "none",
                  transition: "all 0.2s",
                }}
              >
                {star.num}
              </button>
            );
          })}

          {/* Constellation name on complete */}
          {roundComplete && (
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 0,
                right: 0,
                textAlign: "center",
                color: "#fdcb6e",
                fontSize: 20,
                fontFamily: "'Fredoka One', cursive",
                animation: "popIn 0.5s ease",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {cur.naam}
            </div>
          )}
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
