import { useState, useEffect, useRef } from "react";
import { playSound } from "../data/sounds";
import { speak } from "../data/speech";
import { asset } from "../data/assets";

// Fullscreen rocket launch:
// ready (kid presses the red button) → countdown 3-2-1 (spoken) → ignition
// (smoke, flames, shake, rumble) → liftoff (ground drops away, clouds rush
// past, sky turns from blue to space) → arrival (space background) → onComplete.
const TIMING = { count: 900, ignition: 1300, liftoff: 3200, arrival: 1600 };
const SPRITE = 160; // rocket frame on screen (sprite frames are 32px, ×5)

const CLOUDS = [
  { left: "8%", size: 150, delay: 0.1 },
  { left: "58%", size: 190, delay: 0.5 },
  { left: "22%", size: 120, delay: 0.9 },
  { left: "66%", size: 140, delay: 1.3 },
  { left: "-4%", size: 170, delay: 1.6 },
];

function Cloud({ size, style }) {
  return (
    <div style={{ position: "absolute", width: size, height: size * 0.45, ...style }}>
      {[[0, 0.35, 0.55], [0.25, 0, 0.6], [0.55, 0.25, 0.5]].map(([x, y, s], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: size * x,
            top: size * 0.45 * y,
            width: size * s,
            height: size * s,
            borderRadius: "50%",
            background: "white",
            opacity: 0.95,
          }}
        />
      ))}
    </div>
  );
}

export default function RocketLaunch({ onComplete }) {
  const [phase, setPhase] = useState("ready"); // ready | countdown | ignition | liftoff | arrival
  const [count, setCount] = useState(3);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Countdown 3 → 2 → 1 → ignition
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count === 0) {
      playSound("rumble");
      speak("Start!");
      setPhase("ignition");
      return;
    }
    playSound("beep");
    speak(["", "Een", "Twee", "Drie"][count]);
    const t = setTimeout(() => setCount((c) => c - 1), TIMING.count);
    return () => clearTimeout(t);
  }, [phase, count]);

  // Timed phases after ignition
  useEffect(() => {
    const next = { ignition: "liftoff", liftoff: "arrival" }[phase];
    if (next) {
      const t = setTimeout(() => setPhase(next), TIMING[phase]);
      return () => clearTimeout(t);
    }
    if (phase === "arrival") {
      speak("Welkom in de ruimte!");
      const t = setTimeout(() => onCompleteRef.current(), TIMING.arrival);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const flying = phase === "liftoff" || phase === "arrival";
  const burning = phase === "ignition" || flying;
  const smoking = (phase === "countdown" && count <= 1) || phase === "ignition" || phase === "liftoff";

  const start = () => {
    playSound("click");
    setPhase("countdown");
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, overflow: "hidden", background: "#7ec8f0" }}>
      {/* Sky layers crossfade: day → dusk → space */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #4aa8e8 0%, #a8dcf7 100%)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #1b2a6b 0%, #6a4c9c 60%, #f0a868 100%)",
          opacity: flying ? 1 : 0,
          transition: `opacity ${TIMING.liftoff * 0.45}ms ease-in`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#070b24",
          opacity: flying ? 1 : 0,
          transition: `opacity ${TIMING.liftoff * 0.5}ms ease-in ${TIMING.liftoff * 0.45}ms`,
        }}
      />

      {/* Stars appear once we're high up */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: flying ? 1 : 0,
          transition: `opacity 1s ease ${TIMING.liftoff * 0.6}ms`,
        }}
      >
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              width: i % 4 === 0 ? 3 : 2,
              height: i % 4 === 0 ? 3 : 2,
              background: "white",
              borderRadius: "50%",
              animation: `rlTwinkle ${1.2 + (i % 3) * 0.5}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Clouds rushing past during liftoff */}
      {phase === "liftoff" &&
        CLOUDS.map((c, i) => (
          <Cloud
            key={i}
            size={c.size}
            style={{
              left: c.left,
              top: 0,
              animation: `rlCloudFall 1.1s linear ${c.delay}s both`,
            }}
          />
        ))}

      {/* Ground, tower and launch pad — drop away on liftoff */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "34%",
          transform: flying ? "translateY(calc(100% + 300px))" : "none", // incl. the tower sticking out
          transition: flying ? `transform ${TIMING.liftoff * 0.5}ms cubic-bezier(0.5, 0, 0.9, 0.6)` : "none",
        }}
      >
        <div style={{ position: "absolute", inset: "30% 0 0 0", background: "linear-gradient(180deg, #7bc86c 0%, #4f9a45 100%)" }} />
        <div style={{ position: "absolute", left: "50%", top: "22%", width: 220, height: 34, marginLeft: -110, borderRadius: "50%", background: "#9aa4ad", border: "4px solid #f1c40f" }} />
        {/* Launch tower */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "72%",
            marginLeft: 70,
            width: 26,
            height: 230,
            background: "repeating-linear-gradient(45deg, #c0392b 0 10px, #e74c3c 10px 20px)",
            border: "3px solid #7f1d1d",
            borderRadius: 4,
          }}
        />
      </div>

      {/* Smoke clouds at the base */}
      {smoking && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "20%",
            width: 0,
            height: 0,
            // Smoke stays with the ground and thins out as we climb
            transform: flying ? "translateY(60vh)" : "none",
            opacity: flying ? 0 : 1,
            transition: flying ? `transform ${TIMING.liftoff * 0.5}ms ease-in, opacity ${TIMING.liftoff * 0.5}ms` : "none",
          }}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 90,
                height: 90,
                marginLeft: -45,
                marginTop: -45,
                borderRadius: "50%",
                background: "radial-gradient(circle, #ffffff 0%, #dfe6e9 60%, rgba(223,230,233,0) 72%)",
                animation: `rlSmoke${i % 2 ? "L" : "R"} 1.4s ease-out ${i * 0.17}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Rocket + flame */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "22%",
          marginLeft: -SPRITE / 2,
          width: SPRITE,
          transform:
            phase === "arrival"
              ? "translateY(-120vh) scale(0.5)"
              : phase === "liftoff"
                ? "translateY(-38vh)"
                : "none",
          transition:
            phase === "liftoff"
              ? `transform ${TIMING.liftoff * 0.6}ms cubic-bezier(0.55, 0, 0.45, 1)`
              : phase === "arrival"
                ? `transform ${TIMING.arrival * 0.8}ms ease-in`
                : "none",
          animation: phase === "ignition" ? "rlShake 0.08s infinite" : "none",
        }}
      >
        <div
          style={{
            width: SPRITE,
            height: SPRITE,
            backgroundImage: `url(${asset("sprites/rocket.png")})`,
            backgroundSize: `${SPRITE * 4}px ${SPRITE * 4}px`,
            backgroundPosition: "0 0",
            imageRendering: "pixelated",
            animation: flying ? "rlFrames 0.4s steps(4) infinite" : "none",
            filter: burning ? "drop-shadow(0 0 24px rgba(255,140,0,0.7))" : "none",
          }}
        />
        {burning && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: SPRITE - 26,
              width: 44,
              marginLeft: -22,
              height: flying ? 150 : 70,
              transition: "height 0.4s ease-out",
              transformOrigin: "top center",
              animation: "rlFlicker 0.09s infinite alternate",
              background:
                "radial-gradient(ellipse 50% 70% at 50% 18%, #fffbe0 0%, #ffd23f 30%, #ff8a1f 58%, rgba(255,60,0,0) 78%)",
              borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%",
            }}
          />
        )}
      </div>

      {/* Arrival: the real space world fades in */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${asset("sprites/space-bg.png")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
          opacity: phase === "arrival" ? 1 : 0,
          transition: `opacity ${TIMING.arrival * 0.6}ms ease ${TIMING.arrival * 0.2}ms`,
          pointerEvents: "none",
        }}
      />
      {phase === "arrival" && (
        <div style={{ ...centerText, fontSize: 44, color: "white", animation: "rlCount 1.4s ease-out both" }}>
          Welkom in de ruimte!
        </div>
      )}

      {/* Countdown numbers */}
      {phase === "countdown" && count > 0 && (
        <div key={count} style={{ ...centerText, fontSize: 160, color: "white", animation: `rlCount ${TIMING.count}ms ease-out forwards` }}>
          {count}
        </div>
      )}
      {phase === "ignition" && (
        <div style={{ ...centerText, fontSize: 90, color: "#ffd23f", animation: "rlCount 0.9s ease-out forwards" }}>
          START!
        </div>
      )}

      {/* The big red button: the kid launches the rocket */}
      {phase === "ready" && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, zIndex: 2 }}>
          <div
            data-speak="Klaar voor de start? Druk op de rode knop!"
            style={{
              background: "rgba(255,255,255,0.92)",
              borderRadius: 16,
              padding: "8px 18px",
              fontFamily: "'Fredoka One', cursive",
              fontSize: 20,
              color: "#2d3436",
            }}
          >
            Druk op de rode knop!
          </div>
          <button
            onClick={start}
            aria-label="Lanceer de raket"
            style={{
              width: 112,
              height: 112,
              borderRadius: "50%",
              border: "8px solid #7f1d1d",
              background: "radial-gradient(circle at 35% 30%, #ff8a80 0%, #e53935 45%, #b71c1c 100%)",
              boxShadow: "0 8px 0 #5c1010, 0 12px 24px rgba(0,0,0,0.35)",
              color: "white",
              fontFamily: "'Fredoka One', cursive",
              fontSize: 24,
              cursor: "pointer",
              animation: "rlPulse 1.2s ease-in-out infinite",
            }}
          >
            START
          </button>
        </div>
      )}

      <style>{`
        @keyframes rlShake {
          0% { translate: -3px 0; } 25% { translate: 3px -2px; }
          50% { translate: -2px 1px; } 75% { translate: 2px -1px; } 100% { translate: -3px 2px; }
        }
        @keyframes rlCount {
          0% { transform: scale(0.3); opacity: 0; }
          35% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes rlFlicker {
          0% { transform: scaleX(0.85) scaleY(0.92); opacity: 0.85; }
          100% { transform: scaleX(1.1) scaleY(1.08); opacity: 1; }
        }
        @keyframes rlFrames { to { background-position: -${SPRITE * 4}px 0; } }
        @keyframes rlTwinkle { 0% { opacity: 0.3; } 100% { opacity: 1; } }
        @keyframes rlCloudFall {
          0% { transform: translateY(-40vh); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(130vh); opacity: 1; }
        }
        @keyframes rlSmokeL {
          0% { transform: translate(0, 0) scale(0.3); opacity: 0.9; }
          100% { transform: translate(-190px, -30px) scale(1.8); opacity: 0; }
        }
        @keyframes rlSmokeR {
          0% { transform: translate(0, 0) scale(0.3); opacity: 0.9; }
          100% { transform: translate(190px, -30px) scale(1.8); opacity: 0; }
        }
        @keyframes rlPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.07); }
        }
      `}</style>
    </div>
  );
}

const centerText = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "0 24px",
  fontFamily: "'Fredoka One', cursive",
  textShadow: "0 0 30px rgba(255,170,0,0.8), 0 4px 0 rgba(0,0,0,0.25)",
  pointerEvents: "none",
  zIndex: 3,
};
