import { useState, useRef } from "react";
import { RONDES, VERFPOTTEN, getPot, mixResult } from "../data/kleuren";
import { playSound } from "../data/sounds";
import { shuffle } from "../data/woorden";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const R = 6;
const COLOR = "#a29bfe";

function MixCircle({ kleur }) {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        background: kleur ?? "#ececec",
        border: "3px solid rgba(0,0,0,0.07)",
        transition: "background 0.25s",
        flexShrink: 0,
      }}
    />
  );
}

export default function Kleurenmixer({ onBack, onScore }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState([]);
  const [phase, setPhase] = useState("pick"); // "pick" | "mixing" | "ok" | "wrong"
  const [conf, setConf] = useState(false);
  const [done, setDone] = useState(false);
  const [wrongMsg, setWrongMsg] = useState("");

  // Ref keeps selected in sync without stale closure issues in tapPot
  const selectedRef = useRef([]);

  // Primary mixes first, then the white tints — shuffled within each group
  const [rondes] = useState(() => [...shuffle(RONDES.slice(0, 3)), ...shuffle(RONDES.slice(3))]);
  const cur = rondes[round];
  const result = selected.length === 2 ? mixResult(selected[0], selected[1]) : null;

  const checkMix = (sel) => {
    const isCorrect = cur.mix.every((c) => sel.includes(c));

    if (isCorrect) {
      const newScore = score + 1;
      playSound("correct");
      setPhase("mixing");

      setTimeout(() => {
        setScore(newScore);
        setPhase("ok");
        setConf(true);
        setTimeout(() => setConf(false), 1500);

        setTimeout(() => {
          if (round + 1 >= R) {
            setDone(true);
            onScore(newScore);
            playSound("win");
          } else {
            selectedRef.current = [];
            setSelected([]);
            setRound((r) => r + 1);
            setPhase("pick");
          }
        }, 2000);
      }, 1000);
    } else {
      setPhase("wrong");
      // Show and say what this mix really makes — that's the lesson
      const made = mixResult(sel[0], sel[1]);
      setWrongMsg(
        made
          ? `${getPot(sel[0]).naam.replace(/^./, (c) => c.toUpperCase())} en ${getPot(sel[1]).naam} wordt ${made.doel}. We zoeken ${cur.doel}!`
          : `We zoeken ${cur.doel}!`
      );
      playSound("wrong");

      setTimeout(() => {
        selectedRef.current = [];
        setSelected([]);
        setPhase("pick");
      }, 2600);
    }
  };

  const tapPot = (id) => {
    if (phase !== "pick") return;

    const prev = selectedRef.current;
    let next;

    if (prev.includes(id)) {
      next = prev.filter((x) => x !== id);
    } else if (prev.length >= 2) {
      return;
    } else {
      next = [...prev, id];
    }

    selectedRef.current = next;
    setSelected(next);

    if (next.length === 2) checkMix(next);
  };

  if (done) {
    return <DoneScreen emoji={"\ud83c\udfa8"} score={score} total={R} onBack={onBack} />;
  }

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={R} score={score} color={COLOR} />

      {phase === "ok" ? (
        /* Result: painted bike */
        <div style={{ ...S.card, textAlign: "center", animation: "popIn 0.4s ease" }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${cur.kleur}cc, ${cur.kleur})`,
              borderRadius: 20,
              padding: "28px 16px",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 80 }}>{"\ud83d\udeb2"}</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "'Fredoka One', cursive",
                color: "white",
                textShadow: "0 2px 6px rgba(0,0,0,0.25)",
                marginTop: 8,
              }}
            >
              De fiets is {cur.doel} geverfd!
            </div>
          </div>
          <div style={{ fontSize: 16, color: "#888", fontWeight: 600 }}>
            {getPot(cur.mix[0]).naam} + {getPot(cur.mix[1]).naam} = {cur.doel}
          </div>
        </div>
      ) : (
        <div style={{ ...S.card, animation: "popIn 0.3s ease" }}>
          <p data-speak style={S.prompt}>
            {phase === "mixing" ? "Mengen..." : "Verf de fiets! Welke twee kleuren maken..."}
          </p>

          {/* Target color circle + name */}
          <div style={{ textAlign: "center", margin: "8px 0 20px" }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                background:
                  phase === "mixing"
                    ? `conic-gradient(${getPot(selected[0]).kleur} 50%, ${getPot(selected[1]).kleur} 50%)`
                    : cur.kleur,
                margin: "0 auto 12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                animation: phase === "mixing" ? "spin 0.9s linear infinite" : "none",
                transition: "background 0.3s",
              }}
            />
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                fontFamily: "'Fredoka One', cursive",
                color: cur.kleur,
                letterSpacing: 1,
                textShadow: "0 1px 0 rgba(0,0,0,0.06)",
              }}
            >
              {cur.doel.toUpperCase()}
            </div>
          </div>

          {/* Mix preview: [pot1] + [pot2] = [result] */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <MixCircle kleur={selected[0] ? getPot(selected[0]).kleur : null} />
            <span style={{ fontSize: 22, fontWeight: 800, color: "#ccc" }}>+</span>
            <MixCircle kleur={selected[1] ? getPot(selected[1]).kleur : null} />
            <span style={{ fontSize: 22, fontWeight: 800, color: "#ccc" }}>=</span>
            <MixCircle kleur={result ? result.kleur : null} />
          </div>

          {/* Paint pots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            {VERFPOTTEN.map((v) => {
              const isSel = selected.includes(v.id);
              const isWrong = phase === "wrong" && isSel;
              return (
                <button
                  key={v.id}
                  onClick={() => tapPot(v.id)}
                  disabled={phase !== "pick"}
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    background: v.kleur,
                    border: isWrong
                      ? "4px solid #e74c3c"
                      : isSel
                      ? "4px solid #2d3436"
                      : v.id === "wit"
                      ? "3px solid #ddd"
                      : "4px solid transparent",
                    cursor: phase === "pick" ? "pointer" : "default",
                    transition: "transform 0.15s, box-shadow 0.15s, border 0.15s",
                    transform: isSel ? "scale(1.12)" : "scale(1)",
                    boxShadow: isSel
                      ? "0 6px 16px rgba(0,0,0,0.2)"
                      : "0 2px 8px rgba(0,0,0,0.1)",
                    animation: isWrong ? "shake 0.4s" : "none",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    paddingBottom: 7,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "'Quicksand', sans-serif",
                      color: v.id === "wit" ? "#aaa" : "rgba(255,255,255,0.95)",
                      lineHeight: 1,
                      pointerEvents: "none",
                    }}
                  >
                    {v.naam}
                  </span>
                </button>
              );
            })}
          </div>

          {phase === "wrong" && (
            <div data-speak
              style={{
                ...S.fbBub,
                backgroundColor: "#fff3cd",
                color: "#856404",
                marginTop: 16,
              }}
            >
              {wrongMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
