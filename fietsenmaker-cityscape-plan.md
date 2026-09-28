# Fietsenmaker — Cityscape Overworld Plan

## Concept

Replace the current HomeScreen menu with a **top-down 2D city** (Pokemon/RPG-style) where the child cycles through streets on her bicycle. Buildings along the road are game locations, each with a unique theme. Cycling up to a building and pressing a button enters that game.

The city is a single screen (no scrolling needed for v1) — a charming, colorful birds-eye view of a small Dutch town with roads, a canal, trees, and 5 themed buildings + the garage.

---

## City Layout (single screen, ~480x700px playable area)

```
+--------------------------------------------------+
|  [trees]    TREINSTATION        [trees]           |
|              (tracks)                             |
|  ------road------+------road-----------           |
|                   |                               |
|  SCHOOL           |              VERFWINKEL       |
|  (schoolyard)     |              (paint buckets)  |
|                   |                               |
|  ------road-------+------road-----------          |
|                   |                               |
|  MARKT            |              HAVEN            |
|  (market stalls)  |              ~~ water ~~      |
|                   |              (boats, dock)     |
|  ------road-------+------road-----------          |
|                                                   |
|       GARAGE (medals)     [cyclist starts here]   |
|                                                   |
+--------------------------------------------------+
```

## Game-Location Themes

| Location | Game | Theme Description | Visual Cues |
|----------|------|-------------------|-------------|
| Treinstation | Woordenwiel | "Lees de bordjes bij het station" — reading signs at the train station | Train tracks, platform, departure board, trains |
| School | Letterbouwer | "Spel de woorden op school" — spelling at school | Schoolyard, flag, clock, ABC on building |
| Markt | Rekenrace | "Tel en reken op de markt" — counting at market stalls | Market stalls with awnings, fruit/veg crates |
| Haven | Rijmfiets | "Rijmen bij de haven" — rhyming at the harbour | Canal/water, boats, dock, seagulls |
| Verfwinkel | Kleurenmixer | "Meng verf in de verfwinkel" — mixing paint at the paint shop | Colorful facade, paint cans outside, rainbow |
| Garage | Medailles | "Bekijk je medailles in de garage" | Workshop with tools, bike rack |

---

## Technical Architecture

### New/Modified Files

```
src/
  components/
    HomeScreen.jsx       -> DELETE (replaced by CityMap)
    CityMap.jsx          -> NEW: main overworld canvas component
    CityRenderer.js      -> NEW: draws the city (buildings, roads, decorations)
    Player.js            -> NEW: player state + movement logic
    TouchJoystick.jsx    -> NEW: on-screen d-pad for mobile
    BuildingPrompt.jsx   -> NEW: "Ga naar binnen?" popup when near building
  data/
    cityLayout.js        -> NEW: building positions, road tiles, decoration positions
  styles/
    animations.js        -> ADD: new keyframes for city (buildingPulse, etc.)
```

### Approach: HTML5 Canvas + React overlay

- The city background and player are rendered on a **`<canvas>`** element
- UI overlays (building prompt, joystick, star counter) are React components positioned absolutely over the canvas
- This gives smooth 60fps movement without DOM thrashing, while keeping UI elements accessible

### Why Canvas (not pure DOM/CSS)?

- Smooth pixel-based movement for the cyclist
- Easy tile/sprite rendering
- No layout thrashing from moving DOM elements every frame
- Still simple — no game engine needed, just `ctx.drawImage()` in a `requestAnimationFrame` loop

---

## Implementation Steps (for Sonnet)

### Step 1: Create `src/data/cityLayout.js`

Define the city as data:

```js
// All positions in a 480x700 virtual coordinate space
// The canvas will scale to fit the screen

export const TILE_SIZE = 48;
export const CITY_W = 480;
export const CITY_H = 700;

// Each building has: id, label, position (center x,y), size (w,h), color
export const BUILDINGS = [
  {
    id: "woorden",
    label: "Station",
    emoji: "\uD83D\uDE89",       // station emoji for fallback
    x: 180, y: 60, w: 120, h: 80,
    color: "#45B7D1",
    roofColor: "#2980b9",
  },
  {
    id: "letters",
    label: "School",
    emoji: "\uD83C\uDFEB",
    x: 60, y: 220, w: 100, h: 80,
    color: "#A855F7",
    roofColor: "#7c3aed",
  },
  {
    id: "kleuren",
    label: "Verfwinkel",
    emoji: "\uD83C\uDFA8",
    x: 360, y: 220, w: 100, h: 80,
    color: "#a29bfe",
    roofColor: "#6c5ce7",
  },
  {
    id: "rekenen",
    label: "Markt",
    emoji: "\uD83C\uDFEA",
    x: 60, y: 400, w: 100, h: 80,
    color: "#FF9F43",
    roofColor: "#e67e22",
  },
  {
    id: "rijmen",
    label: "Haven",
    emoji: "\u2693",
    x: 360, y: 400, w: 100, h: 80,
    color: "#FF6B6B",
    roofColor: "#ee5a24",
  },
  {
    id: "garage",
    label: "Garage",
    emoji: "\uD83C\uDFC5",
    x: 160, y: 580, w: 100, h: 70,
    color: "#636e72",
    roofColor: "#2d3436",
  },
];

// Roads are defined as rectangles (x, y, w, h)
export const ROADS = [
  // Horizontal roads
  { x: 0, y: 150, w: 480, h: 40 },
  { x: 0, y: 330, w: 480, h: 40 },
  { x: 0, y: 510, w: 480, h: 40 },
  // Vertical road (center)
  { x: 220, y: 0, w: 40, h: 700 },
];

// Decorations: trees, flowers, etc. (drawn as emoji or simple shapes)
export const DECORATIONS = [
  { type: "tree", x: 20, y: 30 },
  { type: "tree", x: 440, y: 30 },
  { type: "tree", x: 20, y: 550 },
  { type: "tree", x: 440, y: 550 },
  { type: "flower", x: 300, y: 120 },
  { type: "flower", x: 140, y: 500 },
  // Water near haven
  { type: "water", x: 320, y: 460, w: 160, h: 50 },
  // Train tracks near station
  { type: "tracks", x: 140, y: 30, w: 200, h: 10 },
];

// Player start position
export const PLAYER_START = { x: 300, y: 600 };

// How close player must be to a building door to interact (in pixels)
export const INTERACT_DISTANCE = 50;
```

### Step 2: Create `src/components/Player.js`

Pure logic module (no React) for player movement:

```js
// Player.js — movement logic, no rendering
// Used by CityMap to update player position each frame

import { CITY_W, CITY_H, BUILDINGS, ROADS, INTERACT_DISTANCE } from "../data/cityLayout";

const SPEED = 3; // pixels per frame
const PLAYER_SIZE = 32;

export function createPlayer(startX, startY) {
  return {
    x: startX,
    y: startY,
    dir: "down",    // "up" | "down" | "left" | "right"
    moving: false,
    frame: 0,       // for animation cycling
  };
}

export function updatePlayer(player, keys) {
  // keys = { up, down, left, right } booleans
  let dx = 0, dy = 0;
  if (keys.up) { dy = -SPEED; player.dir = "up"; }
  if (keys.down) { dy = SPEED; player.dir = "down"; }
  if (keys.left) { dx = -SPEED; player.dir = "left"; }
  if (keys.right) { dx = SPEED; player.dir = "right"; }

  player.moving = dx !== 0 || dy !== 0;
  if (player.moving) player.frame++;

  const nx = player.x + dx;
  const ny = player.y + dy;

  // Only move if new position is on a road or within bounds
  if (isWalkable(nx, ny)) {
    player.x = nx;
    player.y = ny;
  }
}

function isWalkable(x, y) {
  // Player must stay on roads (with some margin around buildings for doors)
  // Keep within city bounds
  if (x < 0 || x > CITY_W - PLAYER_SIZE || y < 0 || y > CITY_H - PLAYER_SIZE) {
    return false;
  }

  // Check if on any road
  for (const road of ROADS) {
    if (
      x + PLAYER_SIZE > road.x &&
      x < road.x + road.w &&
      y + PLAYER_SIZE > road.y &&
      y < road.y + road.h
    ) {
      return true;
    }
  }

  // Allow movement near building entrances (within interact distance)
  for (const b of BUILDINGS) {
    const doorX = b.x;
    const doorY = b.y + b.h; // door is at bottom of building
    const dist = Math.hypot(x - doorX, y - doorY);
    if (dist < INTERACT_DISTANCE + 20) return true;
  }

  return false;
}

export function getNearbyBuilding(player) {
  for (const b of BUILDINGS) {
    const doorX = b.x;
    const doorY = b.y + b.h;
    const dist = Math.hypot(
      (player.x + PLAYER_SIZE / 2) - doorX,
      (player.y + PLAYER_SIZE / 2) - doorY
    );
    if (dist < INTERACT_DISTANCE) return b;
  }
  return null;
}
```

### Step 3: Create `src/components/CityRenderer.js`

Draws everything on canvas. NO SPRITES NEEDED for v1 — uses simple shapes + emoji text:

```js
// CityRenderer.js — draws city on a canvas 2d context
// All rendering is shape-based (rectangles, circles) + emoji text
// Can be upgraded to sprite-based later

import { BUILDINGS, ROADS, DECORATIONS, CITY_W, CITY_H } from "../data/cityLayout";

const GRASS_COLOR = "#90c695";
const ROAD_COLOR = "#8e8e8e";
const ROAD_LINE = "#d4d400";
const WATER_COLOR = "#74b9ff";

export function drawCity(ctx, player, nearBuilding, totalStars) {
  const { width, height } = ctx.canvas;
  const scaleX = width / CITY_W;
  const scaleY = height / CITY_H;
  const scale = Math.min(scaleX, scaleY);

  ctx.save();
  // Center the city
  ctx.translate((width - CITY_W * scale) / 2, (height - CITY_H * scale) / 2);
  ctx.scale(scale, scale);

  // 1. Grass background
  ctx.fillStyle = GRASS_COLOR;
  ctx.fillRect(0, 0, CITY_W, CITY_H);

  // 2. Roads
  for (const r of ROADS) {
    ctx.fillStyle = ROAD_COLOR;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    // Center line (dashed)
    ctx.strokeStyle = ROAD_LINE;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    if (r.w > r.h) {
      // horizontal road
      ctx.beginPath();
      ctx.moveTo(r.x, r.y + r.h / 2);
      ctx.lineTo(r.x + r.w, r.y + r.h / 2);
      ctx.stroke();
    } else {
      // vertical road
      ctx.beginPath();
      ctx.moveTo(r.x + r.w / 2, r.y);
      ctx.lineTo(r.x + r.w / 2, r.y + r.h);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // 3. Decorations
  for (const d of DECORATIONS) {
    if (d.type === "tree") {
      drawTree(ctx, d.x, d.y);
    } else if (d.type === "water") {
      ctx.fillStyle = WATER_COLOR;
      ctx.beginPath();
      ctx.roundRect(d.x, d.y, d.w, d.h, 8);
      ctx.fill();
    } else if (d.type === "tracks") {
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 3;
      for (let i = 0; i < d.w; i += 12) {
        ctx.beginPath();
        ctx.moveTo(d.x + i, d.y);
        ctx.lineTo(d.x + i, d.y + d.h);
        ctx.stroke();
      }
    } else if (d.type === "flower") {
      ctx.font = "16px serif";
      ctx.fillText("\uD83C\uDF38", d.x, d.y);
    }
  }

  // 4. Buildings
  for (const b of BUILDINGS) {
    const isNear = nearBuilding?.id === b.id;
    drawBuilding(ctx, b, isNear);
  }

  // 5. Player (cyclist)
  drawPlayer(ctx, player);

  ctx.restore();
}

function drawTree(ctx, x, y) {
  // Trunk
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(x + 8, y + 16, 8, 10);
  // Leaves (circle)
  ctx.fillStyle = "#27ae60";
  ctx.beginPath();
  ctx.arc(x + 12, y + 12, 14, 0, Math.PI * 2);
  ctx.fill();
}

function drawBuilding(ctx, b, isNear) {
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  ctx.roundRect(b.x - b.w / 2 + 4, b.y - b.h / 2 + 4, b.w, b.h, 6);
  ctx.fill();

  // Main building body
  ctx.fillStyle = b.color;
  ctx.beginPath();
  ctx.roundRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 6);
  ctx.fill();

  // Roof (top strip)
  ctx.fillStyle = b.roofColor;
  ctx.beginPath();
  ctx.roundRect(b.x - b.w / 2 - 4, b.y - b.h / 2 - 8, b.w + 8, 20, [6, 6, 0, 0]);
  ctx.fill();

  // Door
  ctx.fillStyle = "#5D4037";
  ctx.fillRect(b.x - 8, b.y + b.h / 2 - 18, 16, 18);

  // Label
  ctx.fillStyle = "white";
  ctx.font = "bold 13px Quicksand, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(b.label, b.x, b.y);

  // Emoji icon on building
  ctx.font = "24px serif";
  ctx.fillText(b.emoji, b.x, b.y - 14);

  // Glow effect when player is near
  if (isNear) {
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(b.x - b.w / 2 - 4, b.y - b.h / 2 - 10, b.w + 8, b.h + 14, 8);
    ctx.stroke();
  }

  ctx.textAlign = "start";
}

function drawPlayer(ctx, player) {
  const px = player.x;
  const py = player.y;

  // Simple cyclist: circle head + body + wheels
  // Or just use emoji for v1 (much simpler and looks great)
  ctx.font = "28px serif";
  ctx.textAlign = "center";

  // Slight bobbing when moving
  const bob = player.moving ? Math.sin(player.frame * 0.3) * 2 : 0;

  // Direction-aware emoji (bike always looks the same, but we can flip)
  ctx.save();
  ctx.translate(px + 16, py + 16 + bob);
  if (player.dir === "left") {
    ctx.scale(-1, 1);
  }
  ctx.fillText("\uD83D\uDEB4", 0, 0);  // person biking emoji
  ctx.restore();

  ctx.textAlign = "start";
}
```

### Step 4: Create `src/components/TouchJoystick.jsx`

On-screen directional pad for mobile/touch:

```jsx
// TouchJoystick.jsx
// A simple 4-direction pad overlaid on the bottom-left of the screen
// Returns direction via onDirection callback: { up, down, left, right }

import { useRef, useCallback } from "react";

const SIZE = 140;
const BTN = 44;

export default function TouchJoystick({ onDirection }) {
  const activeRef = useRef({ up: false, down: false, left: false, right: false });

  const press = useCallback((dir) => {
    activeRef.current[dir] = true;
    onDirection({ ...activeRef.current });
  }, [onDirection]);

  const release = useCallback((dir) => {
    activeRef.current[dir] = false;
    onDirection({ ...activeRef.current });
  }, [onDirection]);

  const btnStyle = (extra) => ({
    position: "absolute",
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    border: "none",
    background: "rgba(255,255,255,0.5)",
    fontSize: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
    ...extra,
  });

  const handlers = (dir) => ({
    onPointerDown: (e) => { e.preventDefault(); press(dir); },
    onPointerUp: () => release(dir),
    onPointerLeave: () => release(dir),
    onPointerCancel: () => release(dir),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        width: SIZE,
        height: SIZE,
        zIndex: 10,
      }}
    >
      <button style={btnStyle({ left: "50%", top: 0, transform: "translateX(-50%)" })} {...handlers("up")}>
        &#9650;
      </button>
      <button style={btnStyle({ left: 0, top: "50%", transform: "translateY(-50%)" })} {...handlers("left")}>
        &#9664;
      </button>
      <button style={btnStyle({ right: 0, top: "50%", transform: "translateY(-50%)" })} {...handlers("right")}>
        &#9654;
      </button>
      <button style={btnStyle({ left: "50%", bottom: 0, transform: "translateX(-50%)" })} {...handlers("down")}>
        &#9660;
      </button>
    </div>
  );
}
```

### Step 5: Create `src/components/BuildingPrompt.jsx`

Popup when player is near a building:

```jsx
// BuildingPrompt.jsx
// Shows a floating prompt above the player when near a building
// "Ga naar [Station]? [Enter / Tap]"

export default function BuildingPrompt({ building, onEnter }) {
  if (!building) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        background: "white",
        borderRadius: 16,
        padding: "12px 24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        textAlign: "center",
        zIndex: 20,
        animation: "popIn 0.2s ease",
        fontFamily: "'Quicksand', sans-serif",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 4 }}>{building.emoji}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#2d3436", marginBottom: 8 }}>
        {building.label}
      </div>
      <button
        onClick={onEnter}
        style={{
          background: `linear-gradient(135deg, ${building.color}, ${building.roofColor})`,
          color: "white",
          border: "none",
          borderRadius: 12,
          padding: "10px 24px",
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "'Quicksand', sans-serif",
          cursor: "pointer",
          boxShadow: `0 3px 0 ${building.roofColor}`,
        }}
      >
        Ga naar binnen!
      </button>
    </div>
  );
}
```

### Step 6: Create `src/components/CityMap.jsx`

Main component that ties it all together:

```jsx
// CityMap.jsx
// The overworld city map. Replaces HomeScreen.
// Uses <canvas> for the city + React overlays for UI.

import { useRef, useEffect, useState, useCallback } from "react";
import { PLAYER_START } from "../data/cityLayout";
import { createPlayer, updatePlayer, getNearbyBuilding } from "./Player";
import { drawCity } from "./CityRenderer";
import TouchJoystick from "./TouchJoystick";
import BuildingPrompt from "./BuildingPrompt";

export default function CityMap({ onSelect, onGarage, progress, totalStars, todayPlayed }) {
  const canvasRef = useRef(null);
  const playerRef = useRef(createPlayer(PLAYER_START.x, PLAYER_START.y));
  const keysRef = useRef({ up: false, down: false, left: false, right: false });
  const [nearBuilding, setNearBuilding] = useState(null);

  // Keyboard input
  useEffect(() => {
    const keyMap = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right",
    };

    const onDown = (e) => {
      const dir = keyMap[e.key];
      if (dir) { keysRef.current[dir] = true; e.preventDefault(); }
      // Enter to interact
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
  }, []);

  // Game loop
  useEffect(() => {
    let animId;
    const loop = () => {
      updatePlayer(playerRef.current, keysRef.current);
      const nb = getNearbyBuilding(playerRef.current);
      setNearBuilding((prev) => {
        if (prev?.id !== nb?.id) return nb;
        return prev;
      });

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        drawCity(ctx, playerRef.current, nb, totalStars);
      }

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [totalStars]);

  // Resize canvas
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

  const enterBuilding = useCallback((building) => {
    if (building.id === "garage") {
      onGarage();
    } else {
      onSelect(building.id);
    }
  }, [onSelect, onGarage]);

  const handleTouch = useCallback((dirs) => {
    keysRef.current = dirs;
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />

      {/* Stars counter top-right */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "rgba(255,255,255,0.85)",
          borderRadius: 16,
          padding: "8px 16px",
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "'Quicksand', sans-serif",
          color: "#e67e22",
          zIndex: 10,
        }}
      >
        \u2B50 {totalStars}
      </div>

      {/* Title top-left */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          fontFamily: "'Fredoka One', cursive",
          fontSize: 22,
          color: "white",
          textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          zIndex: 10,
        }}
      >
        Fietsenmaker
      </div>

      {/* Today played indicator */}
      {todayPlayed && (
        <div
          style={{
            position: "absolute",
            top: 50,
            right: 16,
            background: "rgba(255,255,255,0.85)",
            borderRadius: 12,
            padding: "4px 12px",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Quicksand', sans-serif",
            color: "#27ae60",
            zIndex: 10,
          }}
        >
          \u2705 Vandaag gespeeld
        </div>
      )}

      {/* Building interaction prompt */}
      <BuildingPrompt
        building={nearBuilding}
        onEnter={() => nearBuilding && enterBuilding(nearBuilding)}
      />

      {/* Touch controls */}
      <TouchJoystick onDirection={handleTouch} />
    </div>
  );
}
```

### Step 7: Update `App.jsx`

Replace `HomeScreen` import with `CityMap`:

```jsx
// In App.jsx:
// - Replace: import HomeScreen from "./components/HomeScreen";
// - With:    import CityMap from "./components/CityMap";
// - Replace the HomeScreen JSX with CityMap (same props)

{screen === "home" && (
  <CityMap
    onSelect={setScreen}
    onGarage={() => setScreen("garage")}
    progress={progress}
    totalStars={totalStars}
    todayPlayed={todayPlayed}
  />
)}
```

### Step 8: Update game themes (optional but recommended)

Update the prompt text in each game to match its city location theme:

- **Woordenwiel.jsx**: Change prompt from "Welk woord hoort bij dit plaatje?" to "Welk woord staat op het stationsbord?"
- **Rekenrace.jsx**: Change "Hoeveel zijn het er?" to "Tel de spullen op de markt!"
- **Letterbouwer.jsx**: Change "Bouw het woord!" to "Spel het woord op het schoolbord!"
- **Rijmfiets.jsx**: Change "Welk woord rijmt op..." to "De zeeman zoekt een rijmwoord voor..."
- **Kleurenmixer.jsx**: Already has "Verf de fiets!" theme — keep as is

### Step 9: Add new animations to `animations.js`

```js
// Add to KF string:
@keyframes buildingPulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}
```

---

## Movement & Collision Rules

1. Player can ONLY walk on roads (gray rectangles) and in a small radius around building doors
2. Buildings, trees, water are solid — player cannot walk through them
3. Speed: 3px per frame (~180px/sec at 60fps) — feels responsive for a child
4. Player is represented by the cycling emoji (person biking) — flips horizontally when going left
5. Slight vertical bobbing animation when moving

## Interaction Flow

1. Player cycles around the city using arrow keys / WASD / touch d-pad
2. When within `INTERACT_DISTANCE` (50px) of a building's door, the building glows gold
3. A `BuildingPrompt` popup appears: building emoji + name + "Ga naar binnen!" button
4. Player can press Enter/Space or tap the button to enter the game
5. After completing the game, player returns to the city map at the same position

## Mobile Support

- Touch joystick (d-pad) in bottom-left corner — 4 directional buttons
- Building prompt has a large tap target ("Ga naar binnen!" button)
- Canvas scales to fill the screen while maintaining aspect ratio

---

## Sprite & Image Assets

The game uses sprite images for the city map. Generate each image separately and place them in `public/sprites/`. The CityRenderer loads them via `new Image()` with paths like `/sprites/tileset.png`.

All sprites share a consistent style: **top-down 3/4 perspective** (like Pokemon Gen 3 / Stardew Valley), bright saturated colors, thick dark outlines (1-2px), child-friendly and cheerful. NO realistic style, NO isometric, NO flat 2D. Think "cute pixel art RPG town for a 5-year-old".

### File structure

```
public/
  sprites/
    tileset.png          # ground tiles (grass, road, water, tracks)
    buildings.png        # all 6 buildings on one sheet
    cyclist.png          # player character spritesheet
    decorations.png      # trees, flowers, boats, etc.
    ui-dpad.png          # (optional) d-pad graphic
```

---

### IMAGE 1: Ground Tileset — `tileset.png`

**Size**: 128x32px (8 tiles of 16x16px in a single row)
**Format**: PNG with transparency

**Prompt**:
```
Pixel art tileset, single horizontal strip of 8 tiles, each tile exactly 16x16 pixels.
Top-down 3/4 perspective, Pokemon Gen 3 / Stardew Valley style.
Bright, saturated, child-friendly colors with 1px dark outlines.

Tile 1: Bright green grass with subtle 2-shade variation and tiny darker grass tufts
Tile 2: Gray asphalt road, smooth, with subtle texture
Tile 3: Gray asphalt road with a dashed yellow center line (horizontal)
Tile 4: Gray asphalt road with a dashed yellow center line (vertical)
Tile 5: Sidewalk / path — light beige cobblestone pattern
Tile 6: Blue water / canal — animated-looking with small wave highlights in lighter blue
Tile 7: Train tracks on gravel — two parallel dark rails on brown/gray gravel bed
Tile 8: Dark green grass (for variety / park areas)

Clean pixel art, no anti-aliasing, transparent background outside tiles.
The tiles must seamlessly tile when placed next to each other.
```

**How Sonnet uses it**: Each tile is referenced by index (0-7). The `cityLayout.js` map data is a 2D grid of tile indices. `CityRenderer.js` draws them with `ctx.drawImage(tileset, tileIndex * 16, 0, 16, 16, destX, destY, 16, 16)`.

---

### IMAGE 2: Buildings — `buildings.png`

**Size**: 384x128px (6 buildings, each 64x128px, arranged in a row)
**Format**: PNG with transparency

Each building is 64px wide x 128px tall. The top ~64px is the roof/upper structure, the bottom ~64px is the wall/door/ground-level detail. This gives a nice 3/4 view depth.

**Prompt**:
```
Pixel art spritesheet of 6 small buildings in a single horizontal row.
Each building is exactly 64 pixels wide and 128 pixels tall.
Top-down 3/4 perspective (you see the front wall AND the roof from above),
like Pokemon Gen 3 town buildings or Stardew Valley.
Bright, saturated, child-friendly. Thick dark outlines (1-2px).
Transparent background.

Building 1 — TRAIN STATION (position: x=0):
- Sky blue walls (#45B7D1) with a darker blue pointed roof (#2980b9)
- A large round clock on the front wall showing 3 o'clock
- A wide arched entrance/door at the bottom center
- Small "STATION" sign above the door in white text
- A platform edge visible at the bottom (gray stripe)
- Two small windows with yellow light
- Dutch style: compact, brick-like texture

Building 2 — SCHOOL (position: x=64):
- Purple/violet walls (#A855F7) with a darker purple roof (#7c3aed)
- A Dutch flag (red-white-blue horizontal stripes) on a small flagpole on the roof
- "ABC" written on a small green chalkboard sign next to the door
- A red wooden door at the bottom center
- Two windows with children's drawings visible (colorful shapes)
- A small bell tower or bell on the roof
- Schoolyard feel: maybe a tiny hopscotch pattern at the base

Building 3 — MARKET STALL (position: x=128):
- Orange/warm yellow wooden market stall (#FF9F43) with striped awning (#e67e22 and white stripes)
- Open front (no door) — you can see inside
- Wooden crates with colorful fruits visible (red apples, yellow bananas, green pears)
- A small hanging scale/balance
- Rustic wooden beams and posts
- A small price sign with numbers
- Cozy Dutch market (markt) feeling

Building 4 — HARBOR / HAVEN (position: x=192):
- Red/coral colored harbor building (#FF6B6B) with dark red-brown roof (#ee5a24)
- A wooden dock/pier extending from the bottom of the building
- A small boat (blue and white) moored next to it
- A round life preserver (red and white ring) on the wall
- An anchor symbol on or near the building
- A small porthole window
- Rope coils and a wooden barrel at the base
- Water visible at the very bottom (blue pixels)

Building 5 — PAINT SHOP / VERFWINKEL (position: x=256):
- Lavender/purple walls (#a29bfe) with a deeper purple roof (#6c5ce7)
- The facade is splashed with multiple paint colors (rainbow drips down the wall)
- A paint palette sign hanging above the door
- Small paint cans (red, blue, yellow) stacked outside near the door
- A paintbrush crossed with a paint roller as a shop sign
- A cheerful door painted in rainbow stripes
- Colorful paint footprints on the ground near the entrance

Building 6 — GARAGE / WORKSHOP (position: x=320):
- Dark gray walls (#636e72) with a charcoal roof (#2d3436)
- A large rolling garage door (partially open, showing tools inside)
- A bicycle silhouette or small bike parked outside
- A wrench and screwdriver crossed as a sign
- A trophy/medal symbol (gold star or medal) in the window
- Oil stain on the ground near the entrance
- Toolbox visible at the base
- Industrial but still cute and child-friendly

IMPORTANT: All 6 buildings must have the same art style, same level of detail,
same outline thickness, and feel like they belong in the same town.
Leave transparent space around each building so they don't touch.
Each building should have a clearly visible entrance/door at the bottom-center.
```

**How Sonnet uses it**: Each building is drawn with `ctx.drawImage(buildings, buildingIndex * 64, 0, 64, 128, destX, destY, 64, 128)`. The `cityLayout.js` stores which building index goes where.

---

### IMAGE 3: Cyclist Player Character — `cyclist.png`

**Size**: 128x128px (4 columns x 4 rows, each frame 32x32px)
**Format**: PNG with transparency

Layout of the spritesheet:
```
Row 0 (y=0):   facing DOWN  — frame 1, frame 2, frame 3, frame 4
Row 1 (y=32):  facing LEFT  — frame 1, frame 2, frame 3, frame 4
Row 2 (y=64):  facing RIGHT — frame 1, frame 2, frame 3, frame 4
Row 3 (y=96):  facing UP    — frame 1, frame 2, frame 3, frame 4
```

**Prompt**:
```
Pixel art character spritesheet: a young child (girl, ~6 years old) riding a small bicycle.
Top-down 3/4 perspective, Pokemon Gen 3 overworld character style.
Each frame is exactly 32x32 pixels. 4 columns x 4 rows = 16 frames total.
Transparent background.

Character design:
- Small girl with short brown hair, wearing a bright yellow safety helmet
- Colorful outfit: bright red jacket/shirt, blue pants
- Riding a small orange bicycle with visible wheels
- Cheerful, cute, round proportions (chibi/super-deformed style like Pokemon trainers)
- Thick dark outlines (1-2px), clean pixel art, no anti-aliasing

Spritesheet layout:
Row 1 (top): Character cycling DOWNWARD (facing the viewer) — 4 frames of pedaling animation.
  Frame 1: left foot down on pedal, bike slightly tilted left
  Frame 2: feet level, bike straight
  Frame 3: right foot down on pedal, bike slightly tilted right
  Frame 4: feet level, bike straight (slight variation from frame 2)

Row 2: Character cycling to the LEFT — 4 frames of pedaling animation.
  Side view facing left, same pedaling cycle.

Row 3: Character cycling to the RIGHT — 4 frames of pedaling animation.
  Side view facing right (can be mirror of left but with proper pixel detail).

Row 4 (bottom): Character cycling UPWARD (back to viewer) — 4 frames of pedaling animation.
  You see the back of the helmet, jacket, and bike.

IMPORTANT:
- The character should be centered in each 32x32 frame
- Animation frames should create smooth pedaling motion when cycled
- All 4 directions must have consistent proportions and style
- The bicycle wheels should appear to rotate across frames
- Keep it very simple and readable at 32x32 — don't overdetail
```

**How Sonnet uses it**: `CityRenderer.js` draws the player by picking the correct row (direction) and cycling through columns (animation frames) based on `player.frame % 4`. When standing still, use frame 0. Code: `ctx.drawImage(cyclist, frameCol * 32, dirRow * 32, 32, 32, playerX, playerY, 32, 32)`.

---

### IMAGE 4: Decorations — `decorations.png`

**Size**: 256x64px (various decorations arranged in a strip)
**Format**: PNG with transparency

Layout (left to right):
```
x=0:    Tree type A (32x32) — round leafy tree
x=32:   Tree type B (32x32) — pine/triangular tree
x=64:   Bush (16x16)
x=80:   Flowers red (16x16)
x=96:   Flowers yellow (16x16)
x=112:  Lamp post (16x32)
x=128:  Bench (32x16)
x=160:  Boat on water (32x32)
x=192:  Seagull (16x16)
x=208:  Bicycle rack with bikes (32x16)
x=240:  Barrel (16x16)
```

**Prompt**:
```
Pixel art decorations spritesheet for a cute Dutch town.
Top-down 3/4 perspective, matching Pokemon Gen 3 / Stardew Valley style.
Bright saturated colors, thick dark outlines (1-2px), child-friendly.
All items on a single horizontal strip, transparent background.

Items from left to right:

1. ROUND TREE (32x32px): Classic RPG overworld tree. Dark brown trunk (4px wide),
   large round canopy of bright green leaves with darker green shading.
   Small shadow circle at the base. Lush and cartoon-like.

2. PINE TREE (32x32px): Triangular/conical evergreen tree. Dark trunk,
   3 layers of dark green triangular branches getting smaller toward top.
   Cute and stylized, not realistic.

3. BUSH (16x16px): Small round bright green bush with tiny flowers.
   Sits on the ground, simple round shape with leaf texture.

4. RED FLOWERS (16x16px): Small cluster of 3-4 red flowers with green stems.
   Tulip-like (Dutch!). Cheerful and bright.

5. YELLOW FLOWERS (16x16px): Same style as red flowers but yellow/orange.
   Could be daffodils or simple round flowers.

6. LAMP POST (16x32px): Classic Dutch street lamp. Dark iron/black post
   with an ornate lamp head at the top glowing warm yellow.
   Tall and thin, elegant Victorian style but simplified.

7. PARK BENCH (32x16px): Wooden bench seen from above/3/4 view.
   Brown wooden slats, dark metal armrests on each side.
   Cozy and inviting.

8. SMALL BOAT (32x32px): Cute small wooden rowing boat or fishing boat.
   Blue and white hull, seen floating on implied water.
   Maybe a tiny fishing rod poking out, or a crab on the edge.
   Dutch-style flat-bottom boat (platbodem).

9. SEAGULL (16x16px): Tiny cute seagull, white with gray wing tips.
   Standing pose, seen from above. Tiny orange beak and feet.

10. BICYCLE RACK (32x16px): Metal bicycle rack with 2-3 small parked bicycles.
    Seen from top-down. Classic Dutch bike rack shape.
    Bikes are tiny but recognizable — circles for wheels, lines for frames.

11. BARREL (16x16px): Wooden barrel, brown with darker bands/hoops.
    Seen from above, circular top visible.

IMPORTANT: All items must be the exact pixel sizes listed.
All share the same art style, same outline thickness, same color saturation.
Items should look good when placed on both green grass and gray road tiles.
```

**How Sonnet uses it**: Each decoration has a defined source rectangle. `CityRenderer.js` maps decoration types to `{ sx, sy, sw, sh }` and draws with `ctx.drawImage(decoSheet, sx, sy, sw, sh, destX, destY, sw, sh)`. The `cityLayout.js` decoration array references types like `"treeA"`, `"boat"`, `"seagull"`.

---

### IMAGE 5 (optional): City Background — `city-bg.png`

Instead of tile-by-tile rendering, you can generate ONE full pre-rendered background image. This is simpler to implement (just draw it once behind everything) but less flexible.

**Size**: 480x700px (or 960x1400px for 2x resolution)
**Format**: PNG

**Prompt**:
```
Top-down pixel art map of a small, cute Dutch town for a children's game.
480x700 pixels (or 960x1400 at 2x).
Pokemon Gen 3 / Stardew Valley overworld style.
Bright, colorful, child-friendly, thick outlines.

The town layout (top to bottom):
- TOP: A train station with tracks running horizontally across the top.
  Two small trees flank the station. The station has a blue roof.

- A horizontal gray road runs below the station with dashed yellow center line.

- MIDDLE-LEFT: A purple school building with a small schoolyard and flag.
- MIDDLE-RIGHT: A lavender paint shop with rainbow paint splashes on the walls.

- A vertical gray road connects the horizontal roads in the center.

- Another horizontal gray road in the middle.

- LOWER-LEFT: An orange market stall with awning and fruit crates.
- LOWER-RIGHT: A red harbor building with a wooden dock.
  A canal/water area flows past the harbor (blue water with wave details).
  A small boat is moored at the dock. A seagull sits nearby.

- Another horizontal road near the bottom.

- BOTTOM-CENTER: A gray garage/workshop building with a bike rack outside.

Between the buildings: bright green grass, scattered flowers (red tulips, yellow daffodils),
round leafy trees, park benches, lamp posts, a bicycle rack.

The roads form a grid of 3 horizontal roads + 1 vertical road connecting them.
Roads are gray asphalt with dashed yellow center lines.

The overall feeling should be warm, inviting, and magical — like a tiny world
a child would want to explore on a bicycle.
Sunny day, bright colors, maybe tiny birds in the sky.

DO NOT include any characters or people in this image — only the environment.
DO NOT include any text or labels on buildings.
```

**How Sonnet uses it**: If using the full background approach, `CityRenderer.js` simply draws this image first with `ctx.drawImage(bg, 0, 0, CITY_W, CITY_H)`, then draws the player on top. Buildings still need invisible hitboxes defined in `cityLayout.js` for interaction zones. This is simpler than tile-by-tile but means you can't easily change the layout later.

---

### IMAGE 6 (optional): D-Pad UI — `ui-dpad.png`

**Size**: 128x128px
**Format**: PNG with transparency

**Prompt**:
```
Game UI directional pad (d-pad) for a mobile game, pixel art style.
128x128 pixels, transparent background.

A cross/plus-shaped d-pad centered in the image:
- 4 directional buttons arranged in a plus/cross shape
- Each button ~40x40px with rounded corners
- Soft white/light gray color with subtle gradient (top lighter, bottom slightly darker)
- Each button has a small triangle arrow pointing in its direction
  (up arrow, down arrow, left arrow, right arrow)
- Arrows are dark gray (#555)
- The buttons have a subtle drop shadow for depth
- The center where buttons meet has a small circular hub
- Semi-transparent (about 70% opacity feel) — this overlays on the game

Style: clean, modern, but matches the pixel art game aesthetic.
Should look touchable and child-friendly — buttons are big and clear.
Not too detailed — it's a UI element, not pixel art scenery.
```

---

### Tips for sprite generation

1. **Generate each image separately** — don't try to get everything in one generation
2. **Verify exact pixel sizes** — most AI generators don't produce exact dimensions. You may need to resize/crop in an image editor. The game code depends on exact frame sizes
3. **Test transparency** — make sure backgrounds are truly transparent (PNG-24 with alpha)
4. **Consistent style across all sheets** — if one image comes out with a slightly different style, regenerate it or adjust to match
5. **Start with IMAGE 5 (full background)** — it's the easiest path. You can skip images 1-4 entirely and just use the pre-rendered background + emoji for the player. Upgrade to individual sprites later
6. **Fallback**: The plan's v1 code works entirely WITHOUT sprites (canvas shapes + emoji). Sprites are an upgrade layer on top

### Loading sprites in code

Sonnet should add a sprite loader to `CityRenderer.js`:

```js
const sprites = {};
const SPRITE_FILES = ["tileset", "buildings", "cyclist", "decorations"];

export function loadSprites() {
  return Promise.all(
    SPRITE_FILES.map(
      (name) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => { sprites[name] = img; resolve(); };
          img.onerror = () => resolve(); // graceful fallback — draw shapes if missing
          img.src = `/sprites/${name}.png`;
        })
    )
  );
}

// In drawing code, check: if (sprites.buildings) { use sprite } else { draw shape fallback }
```

---

## Execution Order for Sonnet

1. **Create `src/data/cityLayout.js`** — city data (buildings, roads, decorations, player start)
2. **Create `src/components/Player.js`** — player movement + collision logic
3. **Create `src/components/CityRenderer.js`** — canvas drawing functions
4. **Create `src/components/TouchJoystick.jsx`** — mobile d-pad
5. **Create `src/components/BuildingPrompt.jsx`** — interaction popup
6. **Create `src/components/CityMap.jsx`** — main component tying it all together
7. **Update `App.jsx`** — swap HomeScreen for CityMap
8. **Update game prompt texts** — match themes to locations
9. **Test**: `npm run dev`, cycle around, enter each game, verify return to map
10. **Keep `HomeScreen.jsx`** — don't delete yet, keep as fallback

## Important Notes for Sonnet

- Do NOT install any new npm packages — canvas is built into the browser
- Do NOT use TypeScript — project uses plain JSX
- Do NOT use CSS modules or Tailwind — project uses inline styles
- Keep the same `onSelect` / `onGarage` / `onScore` callback pattern
- The `useProgress` hook and all game components remain unchanged
- The canvas `roundRect` method is widely supported (Chrome 99+, Safari 15.4+)
- Use `requestAnimationFrame` for the game loop, clean up on unmount
- Player position should persist during a session (use refs, not state)
- Emoji rendering on canvas works cross-platform and looks great
- The city is intentionally small (single screen) — a 5-year-old should see everything at once
