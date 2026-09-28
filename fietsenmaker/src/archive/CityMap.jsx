import { useRef, useEffect, useState, useCallback } from "react";
import { PLAYER_START } from "../data/cityLayout";
import { createPlayer, updatePlayer, getNearbyBuilding } from "./Player";
import { drawCity, loadSprites } from "./CityRenderer";
import BuildingPrompt from "./BuildingPrompt";

// Persists the player position across CityMap unmount/remount (entering/leaving games)
let savedPos = null;

export default function CityMap({ onSelect, onGarage, totalStars, todayPlayed }) {
  const start = savedPos ?? PLAYER_START;
  const canvasRef = useRef(null);
  const playerRef = useRef(createPlayer(start.x, start.y));
  const keysRef = useRef({ up: false, down: false, left: false, right: false });
  const [nearBuilding, setNearBuilding] = useState(null);
  const [spritesReady, setSpritesReady] = useState(false);

  // Load sprites once on mount
  useEffect(() => {
    loadSprites().then(() => setSpritesReady(true));
  }, []);

  const enterBuilding = useCallback(
    (building) => {
      savedPos = { x: playerRef.current.x, y: playerRef.current.y };
      if (building.id === "garage") {
        onGarage();
      } else {
        onSelect(building.id);
      }
    },
    [onSelect, onGarage]
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
      if (e.key === "Enter" || e.key === " ") {
        const b = getNearbyBuilding(playerRef.current);
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
  }, [enterBuilding]);

  // Game loop
  useEffect(() => {
    if (!spritesReady) return;

    let animId;
    const loop = () => {
      updatePlayer(playerRef.current, keysRef.current);

      const nb = getNearbyBuilding(playerRef.current);
      setNearBuilding((prev) => (prev?.id !== nb?.id ? nb : prev));

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        drawCity(ctx, playerRef.current, nb);
      }

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [spritesReady]);

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
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
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

      {/* Title */}
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
        Fietsenmaker
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

      {/* Arrow key hint (fades after first move) */}
      {!nearBuilding && (
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
          Gebruik pijltjestoetsen om te fietsen
        </div>
      )}

      {/* Building prompt */}
      <BuildingPrompt
        building={nearBuilding}
        onEnter={() => nearBuilding && enterBuilding(nearBuilding)}
      />
    </div>
  );
}
