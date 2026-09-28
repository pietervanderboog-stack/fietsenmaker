// Space world — free rocket movement between planets
export const DEBUG_DRAW = false;

export const TILE_SIZE = 48;
export const CITY_W = 480;
export const CITY_H = 700;
export const PLAYER_SIZE = 32;

// Positions measured from space-bg.png (object detection on the sprite).
// Labels follow what is actually drawn; the door (bottom-centre) is where
// the rocket parks to enter.
export const BUILDINGS = [
  {
    id: "space_zwaartekracht",
    label: "Saturnus",
    emoji: "🪐",
    x: 93, y: 209, w: 50, h: 40,
    color: "#dfe6e9",
    roofColor: "#b2bec3",
  },
  {
    id: "space_planeten",
    label: "Jupiter",
    emoji: "🪐",
    x: 253, y: 482, w: 76, h: 76,
    color: "#e17055",
    roofColor: "#d63031",
  },
  {
    id: "space_brandstof",
    label: "Ruimtestation",
    emoji: "⛽",
    x: 372, y: 142, w: 150, h: 100,
    color: "#00b894",
    roofColor: "#00cec9",
  },
  {
    id: "space_sterren",
    label: "Sterrenstelsel",
    emoji: "⭐",
    x: 385, y: 561, w: 80, h: 50,
    color: "#fdcb6e",
    roofColor: "#f39c12",
  },
  {
    id: "space_puzzel",
    label: "Sterrenwolk",
    emoji: "🧩",
    x: 82, y: 632, w: 80, h: 50,
    color: "#a29bfe",
    roofColor: "#6c5ce7",
  },
  {
    id: "return_earth",
    label: "Terug naar Aarde",
    emoji: "🌍",
    x: 240, y: 62, w: 50, h: 50,
    color: "#0984e3",
    roofColor: "#0652DD",
    special: "returnEarth",
  },
];

// No roads — rocket has free movement
export const ROADS = [];

export const INTERACT_DISTANCE = 56;

// Space has no edge exits — return to earth is via the building special
export const EXITS = [];
export const ENTRIES = {
  from_rocket: { x: 224, y: 650 },
};

export const PLAYER_START = { x: 224, y: 650 };
