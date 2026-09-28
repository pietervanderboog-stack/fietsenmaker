import { useState, useEffect, useCallback } from "react";
import { MAZES, START_POSITIONS, END_POSITIONS } from "../data/doolhof";
import { playSound } from "../data/sounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const COLOR = "#fdcb6e";
const TOTAL_MAZES = 3;

export default function Doolhof({ onBack, onScore }) {
  const [mazeIdx, setMazeIdx] = useState(0);
  const [pos, setPos] = useState({ ...START_POSITIONS[0] });
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [conf, setConf] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [fb, setFb] = useState(null);

  const maze = MAZES[mazeIdx];
  const endPos = END_POSITIONS[mazeIdx];
  const rows = maze.length;
  const cols = maze[0].length;

  // Timer
  useEffect(() => {
    if (!timerActive || done) return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, done]);

  // Reset on new maze
  useEffect(() => {
    setPos({ ...START_POSITIONS[mazeIdx] });
    setCleared(false);
    setTimer(0);
    setTimerActive(true);
    setFb(null);
  }, [mazeIdx]);

  // Side effects live outside the setState updater: StrictMode calls updaters
  // twice, which played sounds twice and could advance two mazes at once
  const tryMove = useCallback(
    (dr, dc) => {
      if (cleared || done) return;
      const nr = pos.r + dr;
      const nc = pos.c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;
      if (maze[nr][nc] === 1) return;
      playSound("click");
      setPos({ r: nr, c: nc });

      if (nr === endPos.r && nc === endPos.c) {
        setCleared(true);
        setTimerActive(false);
        playSound("correct");
        setConf(true);
        setTimeout(() => setConf(false), 1500);
        const newScore = score + 1;
        setScore(newScore);
        setFb(`Doolhof ${mazeIdx + 1} klaar! De kip is thuis.`);

        setTimeout(() => {
          if (mazeIdx + 1 >= TOTAL_MAZES) {
            setDone(true);
            onScore(newScore);
            playSound("win");
          } else {
            setMazeIdx((i) => i + 1);
          }
        }, 2000);
      }
    },
    [pos, cleared, done, rows, cols, maze, endPos, score, mazeIdx, onScore]
  );

  // Keyboard controls
  useEffect(() => {
    const handler = (e) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          tryMove(-1, 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          tryMove(1, 0);
          break;
        case "ArrowLeft":
          e.preventDefault();
          tryMove(0, -1);
          break;
        case "ArrowRight":
          e.preventDefault();
          tryMove(0, 1);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tryMove]);

  if (done)
    return (
      <DoneScreen
        emoji={"\ud83d\udc14"}
        score={score}
        total={TOTAL_MAZES}
        onBack={onBack}
      />
    );

  const cellSize = Math.min(Math.floor(320 / cols), 40);

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar
        onBack={onBack}
        current={mazeIdx}
        total={TOTAL_MAZES}
        score={score}
        color={COLOR}
      />

      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={S.prompt}>
          Help de kip naar het huis! Tik op de pijlen.
        </p>

        {/* Timer */}
        <div
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: 700,
            color: "#888",
            margin: "0 0 12px",
          }}
        >
          {"\u23f1\ufe0f"} {timer}s
        </div>

        {/* Maze grid */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "0 0 16px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
              gap: 1,
              background: "#795548",
              padding: 2,
              borderRadius: 8,
            }}
          >
            {maze.map((row, ri) =>
              row.map((cell, ci) => {
                const isPlayer = pos.r === ri && pos.c === ci;
                const isEnd = endPos.r === ri && endPos.c === ci;
                const isWall = cell === 1;

                return (
                  <div
                    key={`${ri}-${ci}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: cellSize * 0.65,
                      background: isWall
                        ? "#4caf50"
                        : "#f5e6c8",
                      borderRadius: 2,
                    }}
                  >
                    {isPlayer ? (
                      <span
                        style={{
                          animation: cleared
                            ? "bounce 0.5s infinite"
                            : "none",
                        }}
                      >
                        {"\ud83d\udc14"}
                      </span>
                    ) : isEnd ? (
                      "\ud83c\udfe0"
                    ) : isWall ? (
                      "\ud83c\udf3d"
                    ) : (
                      ""
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Touch controls for mobile */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <button
            onClick={() => tryMove(-1, 0)}
            style={arrowBtnStyle}
            aria-label="Omhoog"
          >
            {"\u2b06\ufe0f"}
          </button>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => tryMove(0, -1)}
              style={arrowBtnStyle}
              aria-label="Links"
            >
              {"\u2b05\ufe0f"}
            </button>
            <button
              onClick={() => tryMove(1, 0)}
              style={arrowBtnStyle}
              aria-label="Omlaag"
            >
              {"\u2b07\ufe0f"}
            </button>
            <button
              onClick={() => tryMove(0, 1)}
              style={arrowBtnStyle}
              aria-label="Rechts"
            >
              {"\u27a1\ufe0f"}
            </button>
          </div>
        </div>

        {fb && (
          <div data-speak
            style={{
              ...S.fbBub,
              backgroundColor: "#d4edda",
              color: "#155724",
            }}
          >
            {fb}
          </div>
        )}
      </div>
    </div>
  );
}

const arrowBtnStyle = {
  width: 56,
  height: 56,
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(180deg, #fdcb6e 0%, #e17055 100%)",
  fontSize: 24,
  cursor: "pointer",
  boxShadow: "0 3px 0 #d35400",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
};
