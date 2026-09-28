import { useState, useEffect, useRef } from "react";
import { playSound } from "../data/sounds";
import { CHEERS, shuffle, pick } from "../data/woorden";
import { VERHALEN, DECORS } from "../data/verhalen";
import { speak, speakAndWait } from "../data/speech";
import Confetti from "../components/Confetti";
import TopBar from "../components/TopBar";
import DoneScreen from "../components/DoneScreen";
import { S } from "../styles/theme";

const COLOR = "#e74c3c";
const ROUNDS = VERHALEN.length;

// One comic panel: decor + actors on stage + optional sky item
function Panel({ scene, width = 110, number, highlight }) {
  const h = Math.round(width * 0.78);
  const lead = width * 0.36;
  return (
    <div
      style={{
        position: "relative",
        width,
        height: h,
        borderRadius: 12,
        background: DECORS[scene.decor],
        border: `3px solid ${highlight ? "#f1c40f" : "#2d3436"}`,
        boxShadow: highlight ? "0 0 0 4px rgba(241,196,15,0.45)" : "0 3px 0 rgba(0,0,0,0.15)",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 2,
        paddingBottom: h * 0.08,
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      {scene.lucht && (
        <span style={{ position: "absolute", top: h * 0.06, right: width * 0.07, fontSize: width * 0.2 }}>
          {scene.lucht}
        </span>
      )}
      {scene.figuren.map((f, i) => (
        <span key={i} style={{ fontSize: i === 0 ? lead : lead * 0.72, lineHeight: 1 }}>
          {f}
        </span>
      ))}
      {number && (
        <span
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#2d3436",
            color: "white",
            fontSize: 13,
            fontWeight: 800,
            lineHeight: "22px",
            textAlign: "center",
          }}
        >
          {number}
        </span>
      )}
    </div>
  );
}

// Curtains open, then each panel is shown big while its sentence is read
function Show({ story, onEnd }) {
  const [step, setStep] = useState(-1); // -1 = curtains still closed
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    // Per-run flag: StrictMode runs effects twice, and a shared ref would let
    // both runs call onEnd (skipping a story)
    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 900));
      for (let i = 0; i < story.scenes.length && !cancelled; i++) {
        setStep(i);
        await speakAndWait(story.scenes[i].zin);
      }
      if (!cancelled) onEndRef.current();
    })();
    return () => { cancelled = true; };
  }, [story]);

  const scene = story.scenes[Math.max(step, 0)];
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, background: "#2d1b1b", padding: "16px 0 12px" }}>
      <div key={step} style={{ display: "flex", justifyContent: "center", animation: "popIn 0.4s ease" }}>
        <Panel scene={scene} width={300} />
      </div>
      <p style={{ color: "white", textAlign: "center", fontSize: 18, fontWeight: 700, minHeight: 48, margin: "12px 16px 0" }}>
        {step >= 0 ? scene.zin : ""}
      </p>
      {/* Curtains */}
      {["left", "right"].map((side) => (
        <div
          key={side}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            [side]: 0,
            width: "50%",
            background: "repeating-linear-gradient(90deg, #c0392b 0 14px, #a93226 14px 28px)",
            transform: step >= 0 ? `translateX(${side === "left" ? "-92%" : "92%"})` : "none",
            transition: "transform 1s ease-in-out",
            boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.3)",
          }}
        />
      ))}
    </div>
  );
}

export default function Toneelstuk({ onBack, onScore }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [placed, setPlaced] = useState([0]); // scene 1 is the given start
  const [tray, setTray] = useState([]);
  const [mistake, setMistake] = useState(false);
  const [shake, setShake] = useState(null);
  const [fb, setFb] = useState(null);
  const [showing, setShowing] = useState(false);
  const [conf, setConf] = useState(false);
  const [done, setDone] = useState(false);

  const story = VERHALEN[round];

  useEffect(() => {
    if (!story) return;
    setPlaced([0]);
    setTray(shuffle(story.scenes.map((_, i) => i).slice(1)));
    setMistake(false);
    setFb(null);
    setShowing(false);
  }, [round]);

  const nextRound = () => {
    if (round + 1 >= ROUNDS) {
      setDone(true);
      onScore(score);
      playSound("win");
    } else {
      setRound((r) => r + 1);
    }
  };

  const tapScene = (idx) => {
    if (showing) return;
    if (idx === placed.length) {
      playSound("click");
      const next = [...placed, idx];
      setPlaced(next);
      setTray((t) => t.filter((i) => i !== idx));
      if (next.length === story.scenes.length) {
        if (!mistake) setScore((s) => s + 1);
        playSound("correct");
        setConf(true);
        setTimeout(() => setConf(false), 1500);
        setFb({ ok: true, t: `${pick(CHEERS)} Het doek gaat open!` });
        setTimeout(() => setShowing(true), 1800);
      }
    } else {
      playSound("wrong");
      setMistake(true);
      setShake(idx);
      setTimeout(() => setShake(null), 450);
      setFb({ ok: false, t: "Wat gebeurt er daarna? Kijk nog eens." });
      setTimeout(() => setFb((f) => (f && !f.ok ? null : f)), 1800);
    }
  };

  if (done) return <DoneScreen emoji={"🎭"} score={score} total={ROUNDS} onBack={onBack} />;
  if (!story) return null;

  const n = story.scenes.length;
  const slotW = n <= 3 ? 118 : n === 4 ? 92 : 74;
  const last = placed[placed.length - 1];

  return (
    <div style={S.gc}>
      <Confetti active={conf} />
      <TopBar onBack={onBack} current={round} total={ROUNDS} score={score} color={COLOR} />

      <div key={round} style={{ ...S.card, animation: "popIn 0.3s ease" }}>
        <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, textAlign: "center", color: COLOR, margin: "0 0 4px" }}>
          {"🎭"} {story.titel}
        </h2>

        {showing ? (
          <Show story={story} onEnd={nextRound} />
        ) : (
          <>
            <p
              data-speak={`${story.titel}. ${story.scenes[0].zin} Wat gebeurt er daarna?`}
              style={{ ...S.prompt, fontSize: 17, color: "#2d3436", fontWeight: 700 }}
            >
              Wat gebeurt er daarna?
            </p>

            {/* Storyboard strip */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "10px 0 6px" }}>
              {story.scenes.map((scene, i) => {
                const filled = i < placed.length;
                return filled ? (
                  <div key={i} style={{ animation: i > 0 ? "popIn 0.3s ease" : "none" }}>
                    <Panel scene={story.scenes[placed[i]]} width={slotW} number={i + 1} highlight={placed[i] === last} />
                  </div>
                ) : (
                  <div
                    key={i}
                    style={{
                      width: slotW,
                      height: Math.round(slotW * 0.78),
                      borderRadius: 12,
                      border: "3px dashed #d0d0d0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#c8c8c8",
                      fontSize: 22,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {i === placed.length ? "?" : i + 1}
                  </div>
                );
              })}
            </div>

            {/* The sentence of the newest panel — spoken when it appears */}
            <p data-speak style={{ textAlign: "center", fontSize: 16, fontWeight: 700, color: "#636e72", minHeight: 24, margin: "4px 0 12px" }}>
              {placed.length > 1 ? story.scenes[last].zin : ""}
            </p>

            {/* Loose panels */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
              {tray.map((idx) => (
                <div key={idx} style={{ position: "relative", animation: shake === idx ? "shake 0.4s" : "none" }}>
                  <button
                    onClick={() => tapScene(idx)}
                    aria-label={story.scenes[idx].zin}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    <Panel scene={story.scenes[idx]} width={128} />
                  </button>
                  <button
                    onClick={() => speak(story.scenes[idx].zin, { force: true })}
                    aria-label="Lees voor"
                    style={{
                      position: "absolute",
                      bottom: -10,
                      right: -10,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border: "2px solid #eee",
                      background: "white",
                      fontSize: 18,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    }}
                  >
                    {"🔊"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {fb && !showing && (
          <div
            data-speak
            style={{ ...S.fbBub, backgroundColor: fb.ok ? "#d4edda" : "#fff3cd", color: fb.ok ? "#155724" : "#856404" }}
          >
            {fb.t}
          </div>
        )}
      </div>
    </div>
  );
}
