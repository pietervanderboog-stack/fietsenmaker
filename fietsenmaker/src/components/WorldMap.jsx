import { useRef, useEffect, useState, useCallback } from "react";
import { WORLDS, CONNECTION_MAP, loadWorldLayout } from "../data/worlds";
import { createPlayer, updatePlayer, getNearbyBuilding } from "./Player";
import { drawWorld, loadWorldSprites } from "./WorldRenderer";
import { createNpcs, updateNpcs } from "./Npcs";
import BuildingPrompt from "./BuildingPrompt";
import RocketLaunch from "./RocketLaunch";
import { START_WORLD, START_LAUNCH, START_TOUCH } from "../data/debug";
import Joystick from "./Joystick";
import SpeechToggle from "./SpeechToggle";

// Persists player position + world across unmount/remount
let savedState = null;

export default function WorldMap({ onSelect, onGarage, totalStars, todayPlayed }) {
  const startWorld = savedState?.worldId || (WORLDS[START_WORLD] ? START_WORLD : "city");
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const keysRef = useRef({ up: false, down: false, left: false, right: false });

  const [currentWorldId, setCurrentWorldId] = useState(startWorld);
  const [layout, setLayout] = useState(null);
  const [nearBuilding, setNearBuilding] = useState(null);
  const [ready, setReady] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const transitioningRef = useRef(false);
  const npcsRef = useRef([]);
  // Touch devices get a joystick; also switch on at the first real touch
  const [touch, setTouch] = useState(
    () => START_TOUCH || window.matchMedia?.("(pointer: coarse)").matches || "ontouchstart" in window
  );
  useEffect(() => {
    if (touch) return;
    const on = () => setTouch(true);
    window.addEventListener("touchstart", on, { once: true });
    return () => window.removeEventListener("touchstart", on);
  }, [touch]);
  const [showRocketLaunch, setShowRocketLaunch] = useState(START_LAUNCH && !savedState);

  const worldDef = WORLDS[currentWorldId];

  // Load layout + sprites when world changes
  useEffect(() => {
    let cancelled = false;
    setReady(false);

    (async () => {
      const worldLayout = await loadWorldLayout(currentWorldId);
      if (cancelled) return;

      await loadWorldSprites(WORLDS[currentWorldId]);
      if (cancelled) return;

      const npcs = await createNpcs(currentWorldId);
      if (cancelled) return;
      npcsRef.current = npcs;
      setLayout(worldLayout);

      // Initialize player position
      if (!playerRef.current) {
        const start = savedState?.pos || worldLayout.PLAYER_START;
        playerRef.current = createPlayer(start.x, start.y);
      }

      setReady(true);
    })();

    return () => { cancelled = true; };
  }, [currentWorldId]);

  // Transition to another world via exit→entry connection
  const handleWorldTransition = useCallback(async (targetWorldId, entryId) => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    setTransitioning(true);

    // Brief fade to black
    await new Promise((r) => setTimeout(r, 300));

    const newLayout = await loadWorldLayout(targetWorldId);
    await loadWorldSprites(WORLDS[targetWorldId]);

    // Look up the named entry point in the target layout
    const entries = newLayout.ENTRIES || {};
    const entryPos = entries[entryId] || newLayout.PLAYER_START;

    playerRef.current.x = entryPos.x;
    playerRef.current.y = entryPos.y;
    playerRef.current.moving = false;

    // Reset keys to prevent continued movement
    keysRef.current = { up: false, down: false, left: false, right: false };

    savedState = { worldId: targetWorldId, pos: entryPos };
    setCurrentWorldId(targetWorldId);
    setNearBuilding(null);

    // Small delay for sprites to settle
    await new Promise((r) => setTimeout(r, 50));
    transitioningRef.current = false;
    setTransitioning(false);
  }, []);

  const enterBuilding = useCallback(
    (building) => {
      savedState = {
        worldId: currentWorldId,
        pos: { x: playerRef.current.x, y: playerRef.current.y },
      };

      if (building.id === "garage") {
        onGarage();
      } else if (building.special === "rocketLaunch") {
        setShowRocketLaunch(true);
      } else if (building.special === "returnEarth") {
        handleWorldTransition("launchpad", "from_space");
      } else {
        onSelect(building.id);
      }
    },
    [onSelect, onGarage, currentWorldId, handleWorldTransition]
  );

  // Keyboard input
  useEffect(() => {
    const keyMap = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right",
    };

    const onDown = (e) => {
      const dir = keyMap[e.key];
      if (dir) { keysRef.current[dir] = true; e.preventDefault(); }
      if ((e.key === "Enter" || e.key === " ") && layout) {
        const b = getNearbyBuilding(playerRef.current, layout);
        if (b) enterBuilding(b);
      }
    };
    const onUp = (e) => {
      const dir = keyMap[e.key];
      if (dir) keysRef.current[dir] = false;
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [enterBuilding, layout]);

  // Game loop
  useEffect(() => {
    if (!ready || !layout) return;

    let animId;
    const loop = () => {
      const event = updatePlayer(
        playerRef.current,
        keysRef.current,
        layout,
        worldDef.movementType,
      );

      // Handle exit zone transitions
      if (event?.type === "exit" && !transitioning) {
        const connection = CONNECTION_MAP[event.exitId];
        if (connection) {
          handleWorldTransition(connection.world, connection.entryId);
        }
      }

      updateNpcs(npcsRef.current);

      const nb = getNearbyBuilding(playerRef.current, layout);
      setNearBuilding((prev) => (prev?.id !== nb?.id ? nb : prev));

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        drawWorld(ctx, playerRef.current, nb, worldDef, layout, npcsRef.current);
      }

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [ready, layout, worldDef, transitioning, handleWorldTransition]);

  // Resize canvas to fill viewport
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />

      {/* Transition overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "black",
          opacity: transitioning ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: transitioning ? "all" : "none",
          zIndex: 50,
        }}
      />

      {/* Stars counter */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "rgba(255,255,255,0.9)",
          borderRadius: 16,
          padding: "8px 16px",
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "'Quicksand', sans-serif",
          color: "#e67e22",
          zIndex: 10,
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        }}
      >
        {"\u2B50"} {totalStars}
      </div>

      {/* Title — shows world name */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          fontFamily: "'Fredoka One', cursive",
          fontSize: 24,
          color: "white",
          textShadow: "0 2px 8px rgba(0,0,0,0.4)",
          zIndex: 10,
        }}
      >
        {worldDef.label}
      </div>

      {/* Today played */}
      {todayPlayed && (
        <div
          style={{
            position: "absolute",
            top: 50,
            right: 16,
            background: "rgba(255,255,255,0.9)",
            borderRadius: 12,
            padding: "4px 12px",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Quicksand', sans-serif",
            color: "#27ae60",
            zIndex: 10,
          }}
        >
          {"\u2705"} Vandaag gespeeld
        </div>
      )}

      <SpeechToggle style={{ position: "absolute", top: 88, right: 16, zIndex: 10 }} />

      {/* Arrow key hint */}
      {!nearBuilding && ready && !touch && (
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.45)",
            color: "white",
            borderRadius: 12,
            padding: "8px 18px",
            fontSize: 14,
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 600,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {worldDef.movementType === "rocket"
            ? "Gebruik pijltjestoetsen om te vliegen"
            : "Gebruik pijltjestoetsen om te fietsen"}
        </div>
      )}


      {/* Building prompt */}
      {touch && ready && !showRocketLaunch && <Joystick keysRef={keysRef} />}

      <BuildingPrompt
        touch={touch}
        building={nearBuilding}
        onEnter={() => nearBuilding && enterBuilding(nearBuilding)}
      />

      {/* Rocket launch animation */}
      {showRocketLaunch && (
        <RocketLaunch
          onComplete={() => {
            setShowRocketLaunch(false);
            handleWorldTransition("space", "from_rocket");
          }}
        />
      )}
    </div>
  );
}
