# Fietsenmaker World Expansion Plan

## Overview

Expand the game from a single city map to 4 interconnected worlds:

```
[Launchpad] ← [City (existing)] → [Farm] → [Dinosaur Jungle]
     ↓ (rocket launch)
  [Space]
```

**Connections via horizontal roads:**
- City LEFT edge → Launchpad area (top + middle roads exit left)
- City RIGHT edge → Farm world (top + middle roads exit right)
- Farm RIGHT edge → Dinosaur Jungle (1 road exits right)

**Special transition:** Cycling to the rocket on the Launchpad → enter rocket → vertical launch animation → Space world (rocket replaces bike, fly between planets)

**Two new buildings in the City:** Theatre (theater-themed game) + Baby Care / Kinderopvang (care-themed game)

---

## World Map Layout (virtual coordinates)

Each world is 480×700 in its own coordinate space. The world system tracks `currentWorld` and teleports the player to the matching edge of the adjacent world on transition.

```
World positions (logical):

  x: -480       x: 0         x: 480       x: 960
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │          │  │          │  │          │  │          │
  │ Launchpad│←→│   City   │←→│   Farm   │←→│  Dino    │
  │          │  │          │  │          │  │  Jungle  │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
       ↓ (rocket)
  ┌──────────┐
  │  Space   │
  │ (planets)│
  └──────────┘
```

---

## Phase 0: World System Infrastructure

**Goal:** Generalize the single-city system to support multiple worlds with seamless transitions.

### 0A: Create `src/data/worlds.js` — World Registry

```js
// World definitions with adjacency map
export const WORLDS = {
  city: {
    id: "city",
    label: "Stad",
    bg: "/sprites/city-bg.png",
    playerSprite: "/sprites/cyclist.png",
    movementType: "cycle", // "cycle" | "rocket"
    layout: () => import("./cityLayout"),
    adjacent: {
      left: { world: "launchpad", entryEdge: "right" },
      right: { world: "farm", entryEdge: "left" },
    },
  },
  launchpad: {
    id: "launchpad",
    label: "Lanceerplatform",
    bg: "/sprites/launchpad-bg.png",
    playerSprite: "/sprites/cyclist.png",
    movementType: "cycle",
    layout: () => import("./launchpadLayout"),
    adjacent: {
      right: { world: "city", entryEdge: "left" },
    },
  },
  space: {
    id: "space",
    label: "Ruimte",
    bg: "/sprites/space-bg.png",
    playerSprite: "/sprites/rocket.png",
    movementType: "rocket", // free 2D movement, no roads
    layout: () => import("./spaceLayout"),
    adjacent: {}, // entered only via rocket launch from launchpad
  },
  farm: {
    id: "farm",
    label: "Boerderij",
    bg: "/sprites/farm-bg.png",
    playerSprite: "/sprites/cyclist.png",
    movementType: "cycle",
    layout: () => import("./farmLayout"),
    adjacent: {
      left: { world: "city", entryEdge: "right" },
      right: { world: "dino", entryEdge: "left" },
    },
  },
  dino: {
    id: "dino",
    label: "Dino Jungle",
    bg: "/sprites/dino-bg.png",
    playerSprite: "/sprites/cyclist.png",
    movementType: "cycle",
    layout: () => import("./dinoLayout"),
    adjacent: {
      left: { world: "farm", entryEdge: "right" },
    },
  },
};
```

### 0B: Refactor `Player.js` — World-aware movement

**Changes to `Player.js`:**
1. `isWalkable()` receives world layout data as parameter instead of importing from `cityLayout`
2. `updatePlayer()` returns a transition event when player walks past a world edge:
   - `{ type: "worldTransition", direction: "left" | "right" }` when x < 0 or x > CITY_W - PLAYER_SIZE
   - `{ type: "rocketLaunch" }` when entering the rocket building on launchpad
3. For `movementType: "rocket"` (space world): no road collision checks — free movement within bounds

```js
// New signature:
export function updatePlayer(player, keys, layout, movementType) {
  // ... movement logic
  // Returns null or { type: "worldTransition", direction } or { type: "rocketLaunch" }
}

export function isWalkable(x, y, layout, movementType) {
  if (movementType === "rocket") {
    // Free movement within bounds
    return x >= 0 && x <= layout.CITY_W - PLAYER_SIZE
        && y >= 0 && y <= layout.CITY_H - PLAYER_SIZE;
  }
  // Existing road + building-door logic using layout.ROADS, layout.BUILDINGS
}
```

### 0C: Refactor `CityRenderer.js` → `WorldRenderer.js`

**Changes:**
1. Rename file to `WorldRenderer.js`
2. `loadSprites(worldDef)` — loads world-specific background + player sprite
3. `drawWorld(ctx, player, nearBuilding, worldDef, layout)` — replaces `drawCity()`
4. Sprite cache keyed by world ID to avoid reloading
5. Debug draw uses layout data parameter instead of import

### 0D: Refactor `CityMap.jsx` → `WorldMap.jsx`

**Changes:**
1. Add `currentWorld` state (default: `"city"`)
2. Load world layout dynamically based on `currentWorld`
3. Handle world transition events from `updatePlayer()`:
   - Fade-to-black transition (300ms)
   - Set new world + player position at entry edge
   - Load new sprites
4. Handle rocket launch: play launch animation → switch to space world
5. Pass `worldDef` and `layout` to renderer and player functions

**Entry positions when transitioning:**
```js
const ENTRY_POSITIONS = {
  left:   (layout) => ({ x: 4, y: findRoadY(layout, "left") }),
  right:  (layout) => ({ x: layout.CITY_W - PLAYER_SIZE - 4, y: findRoadY(layout, "right") }),
  bottom: (layout) => ({ x: layout.CITY_W / 2, y: layout.CITY_H - PLAYER_SIZE - 4 }),
  rocket: (layout) => ({ x: layout.CITY_W / 2, y: layout.CITY_H - 60 }),
};
```

### 0E: Update `App.jsx` routing

**Changes:**
- Game IDs now include world prefix for new games: `"space_zwaartekracht"`, `"farm_doolhof"`, etc.
- Existing city game IDs stay unchanged for backwards compatibility
- Add lazy imports for all new game components
- `WorldMap` passes `onSelect(gameId)` which App routes to the correct component

### 0F: Update `cityLayout.js` — Add 2 new buildings + exit markers

Add to existing `BUILDINGS` array:
```js
{
  id: "theater",
  label: "Theater",
  emoji: "🎭",
  x: ???, y: ???, w: 100, h: 90,  // position TBD after new bg sprite
  color: "#e74c3c",
  roofColor: "#c0392b",
},
{
  id: "kinderopvang",
  label: "Crèche",
  emoji: "👶",
  x: ???, y: ???, w: 100, h: 90,
  color: "#fd79a8",
  roofColor: "#e84393",
},
```

Add road exit markers (visual arrows/signs pointing left and right at map edges):
```js
export const EXITS = [
  { direction: "left",  roadY: 134 }, // top road exits left → launchpad
  { direction: "left",  roadY: 342 }, // middle road exits left → launchpad
  { direction: "right", roadY: 134 }, // top road exits right → farm
  { direction: "right", roadY: 342 }, // middle road exits right → farm
];
```

---

## Phase 1: Launchpad World

### Layout: `src/data/launchpadLayout.js`

480×700 world. Theme: flat open terrain transitioning from grassland (right) to concrete launch complex (center/left).

```js
export const CITY_W = 480;
export const CITY_H = 700;
export const PLAYER_SIZE = 32;

export const BUILDINGS = [
  {
    id: "rocket",
    label: "Raket",
    emoji: "🚀",
    x: 140, y: 350, w: 80, h: 200,  // tall Tintin-style rocket
    color: "#e74c3c",
    roofColor: "#c0392b",
    special: "rocketLaunch",  // triggers launch sequence instead of game
  },
  {
    id: "controlecentrum",
    label: "Controle",
    emoji: "🖥️",
    x: 360, y: 250, w: 120, h: 90,
    color: "#636e72",
    roofColor: "#2d3436",
    // Optional: a mini-game about launch countdown
  },
];

export const ROADS = [
  { x: 200, y: 134, w: 280, h: 28 },  // top road connecting to city (exits right)
  { x: 200, y: 342, w: 280, h: 28 },  // middle road connecting to city
  { x: 200, y: 134, w: 28,  h: 236 }, // vertical connector between roads
  { x: 80,  y: 280, w: 148, h: 28 },  // path to rocket from vertical
  { x: 80,  y: 280, w: 28,  h: 140 }, // path along rocket
];

export const INTERACT_DISTANCE = 48;
export const PLAYER_START = { x: 440, y: 344 }; // enters from right
```

### Rocket Launch Sequence

When player enters the rocket building:
1. Camera zooms in on rocket
2. Countdown animation: 3... 2... 1...
3. Rocket flames + shake effect
4. Screen scrolls upward rapidly (rocket "lifts off")
5. Fade to starfield → load Space world
6. Implementation: `src/components/RocketLaunch.jsx` — a fullscreen animated overlay
   - Uses CSS keyframes for countdown numbers (scale + fade)
   - Canvas shake effect (random translate ±3px for 1s)
   - Vertical scroll: translate background down over 2s
   - On animation end: callback to switch to space world

---

## Phase 2: Space World

### Layout: `src/data/spaceLayout.js`

480×700 world. Dark starfield background. No roads — free rocket movement. Planets are the "buildings."

```js
export const CITY_W = 480;
export const CITY_H = 700;
export const PLAYER_SIZE = 32;
export const MOVEMENT_TYPE = "rocket";

export const BUILDINGS = [
  {
    id: "space_zwaartekracht",
    label: "Maan",
    emoji: "🌙",
    x: 120, y: 120, w: 80, h: 80,
    color: "#dfe6e9",
    roofColor: "#b2bec3",
  },
  {
    id: "space_planeten",
    label: "Jupiter",
    emoji: "🪐",
    x: 360, y: 200, w: 100, h: 100,
    color: "#e17055",
    roofColor: "#d63031",
  },
  {
    id: "space_brandstof",
    label: "Tankstation",
    emoji: "⛽",
    x: 80, y: 400, w: 70, h: 70,
    color: "#00b894",
    roofColor: "#00cec9",
  },
  {
    id: "space_sterren",
    label: "Sterrenstelsel",
    emoji: "⭐",
    x: 380, y: 480, w: 90, h: 90,
    color: "#fdcb6e",
    roofColor: "#f39c12",
  },
  {
    id: "space_puzzel",
    label: "Ruimtestation",
    emoji: "🛸",
    x: 240, y: 600, w: 100, h: 80,
    color: "#a29bfe",
    roofColor: "#6c5ce7",
  },
];

// No ROADS — rocket has free movement
export const ROADS = [];

// Return-to-earth building (back to launchpad)
export const RETURN_BUILDING = {
  id: "return_earth",
  label: "Terug naar Aarde",
  emoji: "🌍",
  x: 240, y: 50, w: 60, h: 60,
};

export const INTERACT_DISTANCE = 56; // larger for planets
export const PLAYER_START = { x: 224, y: 650 }; // enters from bottom (launched from earth)
```

### Space World Games

#### Game 1: `src/games/ZwaartekrachtSorteer.jsx` — Gravity Sort (Maan)

**Concept:** "Wat is zwaarder?" — Show two objects, child picks which is heavier.
**Rounds:** 8
**Uses:** `useGameRounds` hook

```
Data: src/data/zwaartekracht.js

export const GEWICHTEN = [
  { naam: "Veer", emoji: "🪶", gewicht: 1 },
  { naam: "Appel", emoji: "🍎", gewicht: 2 },
  { naam: "Steen", emoji: "🪨", gewicht: 4 },
  { naam: "Hond", emoji: "🐕", gewicht: 5 },
  { naam: "Auto", emoji: "🚗", gewicht: 8 },
  { naam: "Olifant", emoji: "🐘", gewicht: 10 },
  { naam: "Ballon", emoji: "🎈", gewicht: 0 },
  { naam: "Boek", emoji: "📚", gewicht: 3 },
  { naam: "Fiets", emoji: "🚲", gewicht: 6 },
  { naam: "Huis", emoji: "🏠", gewicht: 9 },
];
```

**UI per round:**
- Prompt: "Wat is zwaarder?" (with moon background)
- Two large emoji buttons side by side
- On correct: object "falls" with gravity animation (translateY + scale), confetti
- On wrong: gentle shake, show correct answer with visual weight comparison
- Difficulty: early rounds have obvious pairs (feather vs elephant), later rounds are closer (book vs apple)

**Implementation pattern:** Same as Woordenwiel — generate question array on mount, map to `useGameRounds`.

#### Game 2: `src/games/PlanetenPad.jsx` — Planet Order (Jupiter)

**Concept:** Sort planets by size OR distance from sun.
**Rounds:** 6
**Does NOT use useGameRounds** — custom drag-to-sort UI.

**UI:**
- Top: instruction "Zet de planeten op volgorde van groot naar klein"
- Scrambled row of 4–5 planet emoji buttons
- Child taps planets in order (like Letterbouwer's letter-by-letter mechanic)
- Slot indicators show how many are placed
- Round 1–3: sort 3 planets by size, Round 4–6: sort 4 planets by distance from sun

```
Data: src/data/planeten.js

export const PLANETEN = [
  { naam: "Mercurius", emoji: "⚫", grootte: 1, afstand: 1 },
  { naam: "Venus",     emoji: "🟡", grootte: 3, afstand: 2 },
  { naam: "Aarde",     emoji: "🌍", grootte: 3, afstand: 3 },
  { naam: "Mars",      emoji: "🔴", grootte: 2, afstand: 4 },
  { naam: "Jupiter",   emoji: "🟤", grootte: 5, afstand: 5 },
  { naam: "Saturnus",  emoji: "🪐", grootte: 4, afstand: 6 },
];
```

#### Game 3: `src/games/RaketBrandstof.jsx` — Rocket Fuel Math (Tankstation)

**Concept:** Addition/subtraction with fuel canisters. "Je hebt 3 blikken. Je hebt er 7 nodig. Hoeveel erbij?"
**Rounds:** 8
**Uses:** `useGameRounds` hook
**Pattern:** Same as Rekenrace but with rocket/fuel theming.

**UI:**
- Visual: fuel canister emojis (🛢️) showing current amount
- Prompt: "De raket heeft [X] blikken brandstof nodig. Je hebt er [Y]. Hoeveel moet je erbij tanken?"
- 4 number buttons as options
- Fuel gauge animation fills up on correct answer
- Difficulty: Round 1-3: sums up to 5, Round 4-6: sums up to 8, Round 7-8: sums up to 10

#### Game 4: `src/games/SterrenVangen.jsx` — Star Connect (Sterrenstelsel)

**Concept:** Connect numbered stars in order (1→2→3...) to form a constellation.
**Rounds:** 4 (each is a constellation)
**Does NOT use useGameRounds** — custom tap-sequence UI.

**UI:**
- Dark background with scattered numbered stars (circles with numbers)
- Child taps stars in ascending order (1, 2, 3...)
- Line draws between correctly tapped stars
- Wrong tap: star wobbles, no line drawn
- When complete: constellation "lights up" with glow effect, name appears
- Round 1: 4 stars, Round 2: 5 stars, Round 3: 6 stars, Round 4: 7 stars

#### Game 5: `src/games/RuimtePuzzel.jsx` — Space Jigsaw (Ruimtestation)

**Concept:** Simple 2×2 or 3×3 tile puzzle of a rocket/planet.
**Rounds:** 3 (2×2, 2×3, 3×3)
**Does NOT use useGameRounds** — custom grid-swap UI.

**UI:**
- Grid of emoji tiles showing parts of a picture (use colored squares as tile pieces)
- One empty slot — child taps adjacent tile to slide it
- Tiles have numbers/letters to help (1-2-3-4 in reading order)
- Completion: image assembles with sparkle animation
- Simple enough for 5-year-olds: 2×2 is just 3 moves

---

## Phase 3: Farm World

### Layout: `src/data/farmLayout.js`

480×700 world. Green rolling fields, dirt paths, red barn, orchard, vegetable garden, sunflower field.

```js
export const CITY_W = 480;
export const CITY_H = 700;
export const PLAYER_SIZE = 32;

export const BUILDINGS = [
  {
    id: "farm_doolhof",
    label: "Maisveld",
    emoji: "🌽",
    x: 100, y: 160, w: 140, h: 100,
    color: "#fdcb6e",
    roofColor: "#f39c12",
  },
  {
    id: "farm_boomgaard",
    label: "Boomgaard",
    emoji: "🍎",
    x: 380, y: 160, w: 100, h: 100,
    color: "#00b894",
    roofColor: "#00cec9",
  },
  {
    id: "farm_dieren",
    label: "Stal",
    emoji: "🐄",
    x: 100, y: 450, w: 130, h: 100,
    color: "#e17055",
    roofColor: "#d63031",
  },
  {
    id: "farm_oogst",
    label: "Moestuin",
    emoji: "🥕",
    x: 380, y: 420, w: 100, h: 100,
    color: "#55efc4",
    roofColor: "#00b894",
  },
  {
    id: "farm_zaadjes",
    label: "Kas",
    emoji: "🌱",
    x: 240, y: 610, w: 120, h: 80,
    color: "#81ecec",
    roofColor: "#00cec9",
  },
];

export const ROADS = [
  // Two entry roads from city (left edge)
  { x: 0,   y: 134, w: 480, h: 28 },  // top horizontal
  { x: 0,   y: 342, w: 480, h: 28 },  // middle horizontal
  // One exit road to dino jungle (right edge, only middle road)
  // (top road dead-ends at boomgaard)
  // Vertical connectors
  { x: 226, y: 134, w: 28, h: 236 },  // center vertical
  // Path to bottom buildings
  { x: 226, y: 342, w: 28, h: 320 },  // center vertical lower
  // Horizontal connectors to buildings
  { x: 100, y: 308, w: 154, h: 28 },  // left building access
  { x: 254, y: 400, w: 130, h: 28 },  // right building access
  { x: 0,   y: 570, w: 480, h: 28 },  // bottom path
];

export const INTERACT_DISTANCE = 48;
export const PLAYER_START = { x: 10, y: 344 };
```

### Farm World Games

#### Game 1: `src/games/Doolhof.jsx` — Corn Maze (Maisveld)

**Concept:** Navigate through a simple top-down grid maze using arrow keys.
**Rounds:** 3 mazes of increasing size
**Does NOT use useGameRounds** — custom maze component.

**UI:**
- Grid-based maze (8×8, then 10×10, then 12×12)
- Player emoji (🐔 chicken trying to get home) at start
- Target emoji (🏠) at end
- Walls rendered as corn/sunflower emoji (🌽🌻)
- Path rendered as dirt-colored squares
- Arrow keys or swipe to move
- Timer shown but not punitive (just for fun)
- On completion: chicken does happy dance, show time

**Maze generation:** Use simple recursive backtracker algorithm. Pre-generate 3 maze seeds in data file to ensure they're solvable and age-appropriate.

```
Data: src/data/doolhof.js
// 3 pre-built mazes as 2D arrays (0=path, 1=wall)
export const MAZES = [ ... ];
```

#### Game 2: `src/games/BoomgaardLetters.jsx` — Orchard Letters (Boomgaard)

**Concept:** Match the first letter to each fruit. "Welke letter hoort bij 🍎?"
**Rounds:** 8
**Uses:** `useGameRounds` hook

```
Data: src/data/boomgaard.js

export const VRUCHTEN = [
  { naam: "Appel",     emoji: "🍎", letter: "A" },
  { naam: "Banaan",    emoji: "🍌", letter: "B" },
  { naam: "Citroen",   emoji: "🍋", letter: "C" },
  { naam: "Druif",     emoji: "🍇", letter: "D" },
  { naam: "Peer",      emoji: "🍐", letter: "P" },
  { naam: "Kers",      emoji: "🍒", letter: "K" },
  { naam: "Sinaasappel", emoji: "🍊", letter: "S" },
  { naam: "Meloen",    emoji: "🍈", letter: "M" },
  { naam: "Aardbei",   emoji: "🍓", letter: "A" },
  { naam: "Watermeloen", emoji: "🍉", letter: "W" },
];
```

**UI:**
- Large fruit emoji at top
- Fruit name written with first letter as "___" (e.g., "_ppel")
- 4 letter buttons as options (1 correct + 3 distractors)
- On correct: letter pops into the word, fruit "bounces" into a basket
- Basket fills up as rounds progress (visual progress)

#### Game 3: `src/games/DierenTellen.jsx` — Animal Counting (Stal)

**Concept:** Count farm animals in a "field" display.
**Rounds:** 8
**Uses:** `useGameRounds` hook

**UI:**
- A green field area with scattered animal emojis
- Prompt: "Hoeveel 🐄 koeien zie je?"
- Sometimes mixed animals to force counting only the asked type
- 4 number buttons
- Difficulty: Round 1-3: single animal type (3-5), Round 4-6: mixed (count one type among others), Round 7-8: count two types and add

```
Data: src/data/boerderijdieren.js

export const DIEREN = [
  { naam: "Koe",     emoji: "🐄" },
  { naam: "Varken",  emoji: "🐷" },
  { naam: "Kip",     emoji: "🐔" },
  { naam: "Schaap",  emoji: "🐑" },
  { naam: "Paard",   emoji: "🐴" },
  { naam: "Geit",    emoji: "🐐" },
  { naam: "Eend",    emoji: "🦆" },
  { naam: "Konijn",  emoji: "🐰" },
];
```

#### Game 4: `src/games/OogstSorteren.jsx` — Harvest Sort (Moestuin)

**Concept:** Drag (tap) vegetables into the correct basket (by color or category).
**Rounds:** 6
**Uses:** `useGameRounds` hook (adapted)

**UI:**
- 2 or 3 baskets at the bottom, each labeled with a color or category
- Vegetable emoji appears at top
- Child taps the correct basket
- Round 1-3: sort by color (red basket: 🍅🫑, green basket: 🥒🥬, orange basket: 🥕🎃)
- Round 4-6: sort by type (fruit vs vegetable, or above-ground vs below-ground)

#### Game 5: `src/games/ZaadjesPlanten.jsx` — Pattern Planting (Kas)

**Concept:** Complete the pattern. "Welk zaadje komt er nu?"
**Rounds:** 6
**Uses:** `useGameRounds` hook

**UI:**
- Row of planted seeds/flowers showing a pattern: 🌻🌷🌻🌷___
- Prompt: "Welke bloem komt hierna?"
- 3-4 flower/plant emoji buttons
- Difficulty: Round 1-2: AB pattern, Round 3-4: ABC pattern, Round 5-6: AABB pattern

```
Data: src/data/zaadjes.js

export const PATRONEN = [
  { reeks: ["🌻","🌷","🌻","🌷"], antwoord: "🌻", opties: ["🌻","🌹","🌷","🌼"] },
  { reeks: ["🌹","🌼","🌹","🌼"], antwoord: "🌹", opties: ["🌷","🌹","🌻","🌼"] },
  // ... etc
];
```

---

## Phase 4: Dinosaur Jungle World

### Layout: `src/data/dinoLayout.js`

480×700 world. Dense jungle, volcanic terrain, dig sites, bone outcrops.

```js
export const CITY_W = 480;
export const CITY_H = 700;
export const PLAYER_SIZE = 32;

export const BUILDINGS = [
  {
    id: "dino_fossiel",
    label: "Opgraving",
    emoji: "🦴",
    x: 120, y: 180, w: 120, h: 100,
    color: "#dfe6e9",
    roofColor: "#b2bec3",
  },
  {
    id: "dino_maten",
    label: "Museum",
    emoji: "🦕",
    x: 370, y: 180, w: 110, h: 100,
    color: "#00b894",
    roofColor: "#00cec9",
  },
  {
    id: "dino_voetafdruk",
    label: "Moeras",
    emoji: "🦶",
    x: 100, y: 450, w: 120, h: 100,
    color: "#636e72",
    roofColor: "#2d3436",
  },
  {
    id: "dino_ei",
    label: "Nest",
    emoji: "🥚",
    x: 370, y: 420, w: 100, h: 100,
    color: "#fdcb6e",
    roofColor: "#f39c12",
  },
  {
    id: "dino_graven",
    label: "Vulkaan",
    emoji: "🌋",
    x: 240, y: 620, w: 110, h: 80,
    color: "#e17055",
    roofColor: "#d63031",
  },
];

export const ROADS = [
  // Entry from farm (left edge, only middle road)
  { x: 0,   y: 342, w: 480, h: 28 },   // main horizontal (jungle path)
  // Winding paths
  { x: 226, y: 120, w: 28, h: 250 },    // center vertical upper
  { x: 226, y: 342, w: 28, h: 320 },    // center vertical lower
  { x: 80,  y: 120, w: 174, h: 28 },    // top left path
  { x: 254, y: 160, w: 130, h: 28 },    // top right path
  { x: 80,  y: 400, w: 174, h: 28 },    // bottom left path
  { x: 254, y: 390, w: 126, h: 28 },    // bottom right path
  { x: 200, y: 570, w: 80,  h: 80 },    // volcano access
];

export const INTERACT_DISTANCE = 48;
export const PLAYER_START = { x: 10, y: 344 };
```

### Dinosaur World Games

#### Game 1: `src/games/FossielPuzzel.jsx` — Fossil Puzzle (Opgraving)

**Concept:** Place dinosaur bones in the correct positions on a skeleton outline.
**Rounds:** 3 (simple → complex skeletons)
**Does NOT use useGameRounds** — custom placement UI.

**UI:**
- Top: skeleton outline with numbered empty slots (gray dashed outlines)
- Bottom: scrambled bone pieces as tappable buttons (emoji representations)
- Bones: 🦴 head, 🦴 body, 🦴 tail, 🦴 legs (represented by labeled icons)
- Child taps a bone → taps a slot → bone snaps in if correct, bounces back if wrong
- Round 1: 3-piece T-Rex (head, body, tail)
- Round 2: 5-piece Triceratops (head, horn, body, legs, tail)
- Round 3: 6-piece Stegosaurus (head, body, plates, legs, tail, spikes)

```
Data: src/data/fossielen.js

export const DINOS = [
  {
    naam: "T-Rex",
    emoji: "🦖",
    onderdelen: [
      { id: "hoofd", label: "Hoofd", slot: 0, emoji: "💀" },
      { id: "lijf",  label: "Lijf",  slot: 1, emoji: "🦴" },
      { id: "staart", label: "Staart", slot: 2, emoji: "🦴" },
    ],
  },
  // ...
];
```

#### Game 2: `src/games/DinoMaten.jsx` — Dino Sizes (Museum)

**Concept:** Sort dinosaurs from biggest to smallest (or vice versa).
**Rounds:** 6
**Uses:** `useGameRounds` hook (tap-in-order variant, like PlanetenPad)

**UI:**
- Prompt: "Zet de dino's op volgorde van groot naar klein"
- 3–4 dinosaur buttons with name + size hint (emoji varies in visual size)
- Child taps in order; each placed dino lines up with scale markers
- Data includes real(ish) sizes:

```
Data: src/data/dinomaten.js

export const DINOS = [
  { naam: "Compsognathus", emoji: "🦎", grootte: 1, label: "Heel klein" },
  { naam: "Velociraptor",  emoji: "🦖", grootte: 2, label: "Klein" },
  { naam: "Triceratops",   emoji: "🦏", grootte: 4, label: "Groot" },
  { naam: "T-Rex",         emoji: "🦖", grootte: 5, label: "Heel groot" },
  { naam: "Brachiosaurus", emoji: "🦕", grootte: 6, label: "Reusachtig" },
];
```

#### Game 3: `src/games/VoetafdrukMatch.jsx` — Footprint Match (Moeras)

**Concept:** Match dinosaur footprints to the correct dinosaur.
**Rounds:** 8
**Uses:** `useGameRounds` hook

**UI:**
- Large "footprint" at top (represented by different shapes/sizes: 🐾 small, 🦶 medium, colored circles for large)
- Prompt: "Van welke dino is deze voetafdruk?"
- 3-4 dinosaur buttons with emoji + name
- Hints based on size: big footprint = big dino, 3-toed = theropod, etc.
- On correct: dinosaur "walks" across screen leaving matching prints

#### Game 4: `src/games/DinoEi.jsx` — Egg Hatch (Nest)

**Concept:** Complete number or letter sequences to hatch dinosaur eggs.
**Rounds:** 6
**Uses:** `useGameRounds` hook

**UI:**
- Large egg emoji (🥚) with crack animation
- Sequence shown: "1, 2, 3, ___"
- 4 buttons with options
- Each correct answer → egg cracks more (4-stage crack animation)
- Final correct → egg hatches 🐣 → reveals baby dino with name
- Difficulty: Round 1-2: numbers 1-5, Round 3-4: numbers 1-10, Round 5-6: letters A-F

```
Data: src/data/dinoeieren.js

export const REEKSEN = [
  { reeks: [1, 2, 3], antwoord: 4, opties: [4, 5, 2, 6], dino: "🦖" },
  { reeks: ["A", "B", "C"], antwoord: "D", opties: ["D", "E", "B", "F"], dino: "🦕" },
  // ...
];
```

#### Game 5: `src/games/BotjesGraven.jsx` — Bone Dig (Vulkaan)

**Concept:** Tap dirt tiles to "dig" and reveal hidden letters. Spell the dinosaur name.
**Rounds:** 4
**Does NOT use useGameRounds** — custom grid-tap UI.

**UI:**
- 4×3 grid of "dirt" tiles (brown squares)
- Each tile hides a letter or is empty
- Child taps to dig (dust animation)
- Revealed letters appear; child must identify the dinosaur name
- Prompt: "Welke dino is hier begraven?"
- Answer buttons at bottom (3 dino options)
- Difficulty: Round 1: 3-letter name (REX), Round 4: 5-letter name (RAPTOR)

---

## Phase 5: City Expansion Games

### Game: `src/games/Toneelstuk.jsx` — Theatre Show (Theater)

**Concept:** Sequence a story — put 4 pictures in the right order to tell a story.
**Rounds:** 4 stories
**Does NOT use useGameRounds** — custom ordering UI.

**UI:**
- 4 scrambled "scene" cards (emoji + short Dutch text)
- Child taps cards in correct story order
- Each correctly placed card lights up
- Stories: simple fairy tales (Roodkapje, De drie biggetjes, etc.)

### Game: `src/games/BabyVerzorgen.jsx` — Baby Care (Crèche)

**Concept:** Matching game — match the baby need to the correct item.
**Rounds:** 8
**Uses:** `useGameRounds` hook

**UI:**
- Baby with a need indicator (crying → hungry, cold, sleepy, dirty)
- 4 item buttons: 🍼 (bottle), 🧥 (clothes), 🛏️ (bed), 🛁 (bath)
- On correct: baby becomes happy 😊, need-specific animation

---

## Nano Banana Sprite Prompts

All sprites must match the existing style: **top-down pixel art, bright saturated colors, 16-bit retro game aesthetic, clean outlines, slightly cartoonish proportions.** The existing city-bg.png is the reference.

### Updated City Background (480×700)

```
Pixel art top-down city map for a children's game. 480x700 pixels.
Same style as a colorful 16-bit retro game with bright saturated colors.

Layout from top to bottom:
- Top: Train station with railroad tracks (existing, unchanged)
- Top road: full-width gray asphalt road with yellow center line
- Middle-left block: Purple school building with clock and rainbow flag
- Middle-right block: Paint shop with rainbow splatters on walls
- Between school and paint shop: a RED THEATRE building with curtain details
  and drama masks, and a PINK BABY CARE / CRÈCHE building with colorful toys
  in windows (place these two in available green spaces)
- Middle road: full-width gray asphalt road
- Bottom-left block: Orange market with striped awning
- Bottom-right block: Red harbor building with wooden dock and blue water
- Bottom road: gray asphalt road (extends to dock area)
- Bottom center: Small gray garage with bicycle
- Central vertical road connecting all horizontal roads

Green grass between buildings with trees, flowers, benches, lamp posts.
Roads clearly exit LEFT and RIGHT at the edges of the map (two roads on
each side lead off-screen with small arrow signs).
```

### Launchpad Background (480×700)

```
Pixel art top-down space launch complex for a children's game. 480x700 pixels.
Same 16-bit retro game style with bright saturated colors and clean outlines.

Right side: green grass transitioning to gray concrete on the left.
Two gray asphalt roads enter from the right edge (matching city roads).
A vertical road connects them.

Center-left: Large concrete launch pad (circular platform with yellow
safety markings). On the pad: a tall red-and-white checkered Tintin-style
rocket standing upright, viewed from above (so it looks like a circle with
a pointed nose cone in the center). Flame trenches visible as dark channels.

Right side: A boxy gray control center building with satellite dishes on
the roof and glowing green screens visible through windows.

Scattered around: fuel tanks, small vehicles, a windsock, safety barriers,
a few scientists in white coats (tiny pixel figures). Night sky gradient
starting at the top-left corner (deep blue with tiny stars) blending into
the green grass on the right. Chain-link fence along the perimeter.
```

### Space Background (480×700)

```
Pixel art top-down deep space scene for a children's game. 480x700 pixels.
Same 16-bit retro game style with bright saturated colors.

Dark navy/black background with colorful stars (white, yellow, blue dots
of varying sizes, some twinkling). A nebula swirl in soft purple/pink in
one corner. No roads — open space.

Scattered planets as landmarks (NOT the player destinations, just
background decoration): a small ringed planet, a gas cloud, an asteroid
belt strip, distant galaxy spiral.

At the top center: Earth visible as a small blue-green circle (this is the
"return to earth" point). Subtle grid lines or star lanes in very faint
blue to help children orient (purely decorative, not gameplay paths).

Feel: magical, wonder-filled, safe (not scary dark), lots of color despite
being "space". Think more Katamari Damacy than realistic astronomy.
```

### Rocket Sprite Sheet (128×128)

```
Pixel art sprite sheet for a children's game rocket ship. 128x128 pixels
total, arranged as 4 columns x 4 rows of 32x32 pixel frames.

The rocket is a cute, chunky Tintin-style rocket: red nose cone, white
body with a round window (porthole), small red fins at the bottom, orange
flame from engines.

Row 1 (facing down/south): 4 animation frames with flame flickering
Row 2 (facing left/west): 4 animation frames, rocket tilted left
Row 3 (facing right/east): 4 animation frames, rocket tilted right
Row 4 (facing up/north): 4 animation frames with flame at bottom

Same pixel art style as the cyclist spritesheet — bold outlines, bright
colors, 32x32 per frame with transparent background.
```

### Farm Background (480×700)

```
Pixel art top-down farm landscape for a children's game. 480x700 pixels.
Same 16-bit retro game style with bright saturated colors and clean outlines.

Rolling green fields with dirt paths instead of asphalt roads. Wooden fences
along path edges. Two dirt paths enter from the left edge, one exits right.

Top-left: Golden cornfield / wheat field (dense yellow-green rows) with a
scarecrow. This is the maze building area.
Top-right: Orchard with rows of fruit trees (round green tops with red/orange
dots for fruit), wooden crates stacked nearby.

Center: A vertical dirt path connects the horizontal paths. A red Dutch-style
barn with white X-pattern doors sits near the center crossing.

Bottom-left: Fenced animal pasture with tiny pixel cows, pigs, chickens
(the stable building). A wooden water trough.
Bottom-right: Vegetable garden with neat rows of colorful crops (orange
carrots, green lettuce, red tomatoes, purple eggplant). A wheelbarrow.

Bottom-center: Glass greenhouse (kas) with translucent green panels and
seedlings visible inside.

Decorations: haystacks, a windmill in the distance, a tractor, a pond with
ducks, wooden signs, flower borders along paths. Blue sky feel — bright
and cheerful pastoral scene.
```

### Dinosaur Jungle Background (480×700)

```
Pixel art top-down prehistoric jungle for a children's game. 480x700 pixels.
Same 16-bit retro game style with bright saturated colors and clean outlines.

Dense tropical jungle with one dirt path entering from the left edge at
mid-height. Paths wind through the jungle connecting different areas.

Top-left: Archaeological dig site — sandy pit with exposed rock layers,
small tools (brushes, picks), a canopy tent over the excavation. Bones
partially visible in the sand.

Top-right: Natural history museum — a rustic wooden building with a
dinosaur skull mounted above the entrance and "MUSEUM" sign.

Center: Lush jungle with oversized ferns, palm trees, tropical flowers
in bright colors. Mysterious fog patches. A few tiny dinosaur silhouettes
peeking from behind trees (friendly, not scary).

Bottom-left: Swampy area with darker green water, lily pads, muddy ground
with visible footprint impressions. Fallen logs.

Bottom-right: Nest area — a sandy clearing with large speckled eggs in a
nest made of branches and leaves. Warm orange glow (near volcano).

Bottom-center: A friendly cartoon volcano — brown/red cone with a wisp
of smoke from the top (NOT erupting, safe and cute). Orange lava streams
as thin decorative lines.

Atmosphere: Adventurous but NOT scary. Think Jurassic Park meets
Animal Crossing — lush, colorful, full of wonder. Vines and flowers
everywhere. Tiny butterflies and dragonflies as decorations.
```

### Cyclist Sprite Sheet Update

The existing cyclist sprite works for all worlds except space. No changes needed — just load the rocket sprite in space world instead.

---

## Implementation Order & Parallel Streams

### Stream A: World Infrastructure (must be first)
1. **A1:** Create `src/data/worlds.js` — world registry
2. **A2:** Refactor `Player.js` — parameterize `isWalkable()` and `updatePlayer()` with layout + movementType
3. **A3:** Rename + refactor `CityRenderer.js` → `WorldRenderer.js` — parameterize `drawWorld()` and `loadSprites()`
4. **A4:** Refactor `CityMap.jsx` → `WorldMap.jsx` — add `currentWorld` state, transition logic, dynamic layout loading
5. **A5:** Update `App.jsx` — add lazy imports for new games, route new game IDs
6. **A6:** Update `cityLayout.js` — add Theatre + Crèche buildings, add EXIT markers
7. **A7:** Add transition effects — fade-to-black between worlds, edge arrow indicators

### Stream B: Space World (after A1-A5 are done)
Can be split into parallel sub-tasks:
1. **B1:** Create `launchpadLayout.js` + `spaceLayout.js`
2. **B2:** Create `RocketLaunch.jsx` — launch animation component
3. **B3:** Create `src/data/zwaartekracht.js` + `ZwaartekrachtSorteer.jsx`
4. **B4:** Create `src/data/planeten.js` + `PlanetenPad.jsx`
5. **B5:** Create `RaketBrandstof.jsx` (uses existing math game pattern)
6. **B6:** Create `SterrenVangen.jsx`
7. **B7:** Create `RuimtePuzzel.jsx`
8. **B8:** Wire all space games into App.jsx routing

### Stream C: Farm World (after A1-A5 are done, parallel with B)
1. **C1:** Create `farmLayout.js`
2. **C2:** Create `src/data/boomgaard.js` + `BoomgaardLetters.jsx`
3. **C3:** Create `src/data/doolhof.js` + `Doolhof.jsx` (maze)
4. **C4:** Create `src/data/boerderijdieren.js` + `DierenTellen.jsx`
5. **C5:** Create `OogstSorteren.jsx`
6. **C6:** Create `src/data/zaadjes.js` + `ZaadjesPlanten.jsx`
7. **C7:** Wire all farm games into App.jsx routing

### Stream D: Dino World (after A1-A5 are done, parallel with B & C)
1. **D1:** Create `dinoLayout.js`
2. **D2:** Create `src/data/fossielen.js` + `FossielPuzzel.jsx`
3. **D3:** Create `src/data/dinomaten.js` + `DinoMaten.jsx`
4. **D4:** Create `VoetafdrukMatch.jsx`
5. **D5:** Create `src/data/dinoeieren.js` + `DinoEi.jsx`
6. **D6:** Create `BotjesGraven.jsx`
7. **D7:** Wire all dino games into App.jsx routing

### Stream E: City Expansion (after A6)
1. **E1:** Create `Toneelstuk.jsx` (theatre game)
2. **E2:** Create `BabyVerzorgen.jsx` (crèche game)
3. **E3:** Wire into App.jsx

### Stream F: Art Assets (parallel from day 1)
1. **F1:** Generate all background sprites via Nano Banana (prompts above)
2. **F2:** Generate rocket sprite sheet
3. **F3:** Generate updated city background with 2 new buildings
4. **F4:** Place all PNGs in `public/sprites/`
5. **F5:** Fine-tune building positions in layout files using DEBUG_DRAW mode

---

## Technical Notes for Implementation

### File naming convention
- Layout files: `src/data/{worldId}Layout.js`
- Game data: `src/data/{gameDataName}.js`
- Game components: `src/games/{GameName}.jsx`
- All new games must export default: `({ onBack, onScore }) => JSX`

### World transition logic (WorldMap.jsx)

```js
// In the game loop, after updatePlayer():
const event = updatePlayer(playerRef.current, keysRef.current, layout, worldDef.movementType);

if (event?.type === "worldTransition") {
  const adj = worldDef.adjacent[event.direction];
  if (adj) {
    // Trigger transition
    setTransitioning(true); // shows black overlay
    setTimeout(() => {
      setCurrentWorld(adj.world);
      // Player position set to entry edge of new world
      const newLayout = loadLayout(adj.world);
      const entryPos = getEntryPosition(adj.entryEdge, newLayout);
      playerRef.current.x = entryPos.x;
      playerRef.current.y = entryPos.y;
      setTransitioning(false);
    }, 300);
  }
}

if (event?.type === "rocketLaunch") {
  setShowRocketLaunch(true);
  // RocketLaunch component calls onComplete → switch to space world
}
```

### Sprite loading per world

```js
// WorldRenderer.js
const spriteCache = {};

export async function loadWorldSprites(worldDef) {
  const key = worldDef.id;
  if (spriteCache[key]) return spriteCache[key];

  const bg = await loadImage(worldDef.bg);
  const player = await loadImage(worldDef.playerSprite);
  spriteCache[key] = { bg, player };
  return spriteCache[key];
}
```

### Game registration in App.jsx

```jsx
// New lazy imports
const ZwaartekrachtSorteer = lazy(() => import("./games/ZwaartekrachtSorteer"));
const PlanetenPad = lazy(() => import("./games/PlanetenPad"));
// ... etc for all 17 new games

// In the screen switch:
case "space_zwaartekracht": return <ZwaartekrachtSorteer onBack={back} onScore={handleScore("space_zwaartekracht")} />;
case "space_planeten":      return <PlanetenPad onBack={back} onScore={handleScore("space_planeten")} />;
// ... etc
```

### Progress system update

The existing `useProgress` hook stores per-game scores keyed by game ID. Since new games use unique IDs (e.g., `"space_zwaartekracht"`), no structural changes are needed — it works automatically.

### Achievements update

Add new achievements in `src/data/achievements.js`:
```js
{ id: "ruimtevaarder", label: "Ruimtevaarder", emoji: "🚀",
  check: (p) => ["space_zwaartekracht","space_planeten","space_brandstof","space_sterren","space_puzzel"]
    .every(g => p[g]?.totalStars > 0) },
{ id: "boer", label: "Boer", emoji: "🌾",
  check: (p) => ["farm_doolhof","farm_boomgaard","farm_dieren","farm_oogst","farm_zaadjes"]
    .every(g => p[g]?.totalStars > 0) },
{ id: "paleontoloog", label: "Paleontoloog", emoji: "🦖",
  check: (p) => ["dino_fossiel","dino_maten","dino_voetafdruk","dino_ei","dino_graven"]
    .every(g => p[g]?.totalStars > 0) },
```

---

## Summary of all new files to create

### Data files (13)
- `src/data/worlds.js`
- `src/data/launchpadLayout.js`
- `src/data/spaceLayout.js`
- `src/data/farmLayout.js`
- `src/data/dinoLayout.js`
- `src/data/zwaartekracht.js`
- `src/data/planeten.js`
- `src/data/boomgaard.js`
- `src/data/doolhof.js`
- `src/data/boerderijdieren.js`
- `src/data/zaadjes.js`
- `src/data/fossielen.js`
- `src/data/dinomaten.js`
- `src/data/dinoeieren.js`

### Game components (17)
- `src/games/ZwaartekrachtSorteer.jsx`
- `src/games/PlanetenPad.jsx`
- `src/games/RaketBrandstof.jsx`
- `src/games/SterrenVangen.jsx`
- `src/games/RuimtePuzzel.jsx`
- `src/games/Doolhof.jsx`
- `src/games/BoomgaardLetters.jsx`
- `src/games/DierenTellen.jsx`
- `src/games/OogstSorteren.jsx`
- `src/games/ZaadjesPlanten.jsx`
- `src/games/FossielPuzzel.jsx`
- `src/games/DinoMaten.jsx`
- `src/games/VoetafdrukMatch.jsx`
- `src/games/DinoEi.jsx`
- `src/games/BotjesGraven.jsx`
- `src/games/Toneelstuk.jsx`
- `src/games/BabyVerzorgen.jsx`

### Infrastructure (refactored)
- `src/components/WorldRenderer.js` (was CityRenderer.js)
- `src/components/WorldMap.jsx` (was CityMap.jsx)
- `src/components/RocketLaunch.jsx` (new)

### Sprites needed (6)
- `public/sprites/launchpad-bg.png` (480×700)
- `public/sprites/space-bg.png` (480×700)
- `public/sprites/farm-bg.png` (480×700)
- `public/sprites/dino-bg.png` (480×700)
- `public/sprites/rocket.png` (128×128 spritesheet)
- `public/sprites/city-bg.png` (updated with theatre + crèche)
