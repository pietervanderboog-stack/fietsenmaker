import { useState, useEffect } from "react";
import { CHEERS, pick } from "../data/woorden";
import { playSound } from "../data/sounds";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const COLOR = "#a29bfe";

// `moves` = random legal moves used to shuffle from the solved state, so the
// puzzle is always solvable and roughly that many moves from done
const PUZZLES = [
  { cols: 2, rows: 2, moves: 6 },
  { cols: 2, rows: 2, moves: 8 },
  { cols: 3, rows: 2, moves: 12 },
  { cols: 3, rows: 3, moves: 18 },
];

const ROUNDS = PUZZLES.length;

const TILE_EMOJIS = [
  "\ud83d\ude80", "\u2b50", "\ud83c\udf19", "\ud83e\ude90",
  "\ud83c\udf0d", "\ud83d\udc7d", "\ud83d\udef8", "\ud83c\udf1f",
];

function createSolvedGrid(cols, rows) {
  const total = cols * rows;
  const grid = [];
  for (let i = 0; i < total - 1; i++) {
    grid.push({ num: i + 1, emoji: TILE_EMOJIS[i] });
  }
  grid.push(null); // empty slot
  return grid;
}

function shuffleGrid(cols, rows, moves) {
  let grid;
  do {
    grid = createSolvedGrid(cols, rows);
    let prev = -1;
    for (let i = 0; i < moves; i++) {
      // Never undo the previous move, or the shuffle cancels itself out
      const options = getAdjacentToEmpty(grid, cols).filter((idx) => idx !== prev);
      const idx = options[Math.floor(Math.random() * options.length)];
      const empty = grid.indexOf(null);
      grid[empty] = grid[idx];
      grid[idx] = null;
      prev = empty;
    }
  } while (isGridSolved(grid));
  return grid;
}

function isGridSolved(grid) {
  const total = grid.length;
  return grid.every(
    (t, i) => (t === null && i === total - 1) || (t && t.num === i + 1)
  );
}

function getAdjacentToEmpty(grid, cols) {
  const emptyIdx = grid.indexOf(null);
  const row = Math.floor(emptyIdx / cols);
  const col = emptyIdx % cols;
  const rows = Math.ceil(grid.length / cols);
  const adjacent = [];

  if (row > 0) adjacent.push(emptyIdx - cols);
  if (row < rows - 1) adjacent.push(emptyIdx + cols);
  if (col > 0) adjacent.push(emptyIdx - 1);
  if (col < cols - 1) adjacent.push(emptyIdx + 1);

  return adjacent;
}

export default function RuimtePuzzel({ onBack, onScore }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState([]);
  const [moves, setMoves] = useState(0);
  const [fb, setFb] = useState(null);
  const [conf, setConf] = useState(false);
  const [done, setDone] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);

  const puzzle = PUZZLES[round];

  useEffect(() => {
    if (round < ROUNDS) {
      const p = PUZZLES[round];
      setGrid(shuffleGrid(p.cols, p.rows, p.moves));
      setMoves(0);
      setFb(null);
      setRoundComplete(false);
    }
  }, [round]);

  const tapTile = (idx) => {
    if (roundComplete) return;

    const { cols } = puzzle;
    const adjacent = getAdjacentToEmpty(grid, cols);

    if (!adjacent.includes(idx)) return;

    playSound("click");
    const newGrid = [...grid];
    const emptyIdx = newGrid.indexOf(null);
    newGrid[emptyIdx] = newGrid[idx];
    newGrid[idx] = null;
    setGrid(newGrid);
    setMoves((m) => m + 1);

    if (isGridSolved(newGrid)) {
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
  };

  if (grid.length === 0 && !done) return null;
  if (done) return <DoneScreen emoji={"\ud83e\udde9"} score={score} total={ROUNDS} onBack={onBack} />;

  const { cols, rows } = puzzle;
  const tileSize = Math.min(84, 280 / cols);

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />
      <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <p data-speak style={S.prompt}>Schuif de paarse tegels, tot het lijkt op het voorbeeld!</p>
        <p style={{ textAlign: "center", fontSize: 14, color: "#aaa", margin: "0 0 4px" }}>
          Zetten: {moves}
        </p>

        {/* What it should look like */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "4px 0 12px" }}>
          <span style={{ fontSize: 13, color: "#888", fontWeight: 700 }}>Zo moet het:</span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 30px)`,
              gap: 2,
              padding: 4,
              background: "#f3f0ff",
              borderRadius: 8,
            }}
          >
            {createSolvedGrid(cols, rows).map((t, i) => (
              <div
                key={i}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  background: t ? "#a29bfe" : "transparent",
                  border: t ? "none" : "1px dashed #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                {t?.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${tileSize}px)`,
            gap: 4,
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          {grid.map((tile, idx) => {
            if (tile === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    borderRadius: 12,
                    background: "rgba(162,155,254,0.1)",
                    border: "2px dashed #ddd",
                  }}
                />
              );
            }

            const adjacent = getAdjacentToEmpty(grid, cols);
            const canMove = adjacent.includes(idx);
            const isCorrect = tile.num === idx + 1;

            return (
              <button
                key={`tile-${tile.num}`}
                onClick={() => tapTile(idx)}
                disabled={roundComplete}
                style={{
                  width: tileSize,
                  height: tileSize,
                  borderRadius: 12,
                  border: roundComplete && isCorrect ? "2px solid #a29bfe" : "none",
                  background: roundComplete
                    ? "linear-gradient(180deg, #a29bfe 0%, #6c5ce7 100%)"
                    : canMove
                    ? "linear-gradient(180deg, #a29bfe 0%, #6c5ce7 100%)"
                    : "linear-gradient(180deg, #ddd 0%, #bbb 100%)",
                  color: "white",
                  fontSize: tileSize > 50 ? 28 : 22,
                  fontWeight: 800,
                  fontFamily: "'Fredoka One', cursive",
                  cursor: canMove && !roundComplete ? "pointer" : "default",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0,
                  padding: 0,
                  boxShadow: canMove ? "0 3px 0 #5b21b6" : "0 2px 0 #999",
                  transition: "all 0.15s",
                  animation: roundComplete ? "buildingPulse 0.8s ease" : "none",
                }}
              >
                <span>{tile.emoji}</span>
                <span style={{ fontSize: tileSize > 50 ? 12 : 10 }}>{tile.num}</span>
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
