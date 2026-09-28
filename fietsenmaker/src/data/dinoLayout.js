// Dinosaur Jungle world — prehistoric jungle with dig sites
export const DEBUG_DRAW = false;

export const TILE_SIZE = 48;
export const CITY_W = 480;
export const CITY_H = 700;
export const PLAYER_SIZE = 32;

export const BUILDINGS = [
  {
    id: "dino_fossiel",
    label: "Opgraving",
    emoji: "\uD83E\uDDB4",
    x: 120, y: 150, w: 150, h: 150,
    color: "#dfe6e9",
    roofColor: "#b2bec3",
  },
  {
    id: "dino_maten",
    label: "Museum",
    emoji: "\uD83E\uDD95",
    x: 360, y: 110, w: 120, h: 100,
    color: "#00b894",
    roofColor: "#00cec9",
  },
  {
    id: "dino_voetafdruk",
    label: "Moeras",
    emoji: "\uD83E\uDDB6",
    x: 100, y: 540, w: 50, h: 50,
    color: "#636e72",
    roofColor: "#2d3436",
  },
  {
    id: "dino_ei",
    label: "Nest",
    emoji: "\uD83E\uDD5A",
    x: 385, y: 570, w: 80, h: 60,
    color: "#fdcb6e",
    roofColor: "#f39c12",
  },
  {
    id: "dino_graven",
    label: "Vulkaan",
    emoji: "\uD83C\uDF0B",
    x: 240, y: 620, w: 110, h: 80,
    color: "#e17055",
    roofColor: "#d63031",
  },
];

export const ROADS = [
  { x: 0,   y: 350, w: 480, h: 30 },   // main horizontal (entry from farm on left)
  { x: 60, y: 100, w: 60,  h: 274 },   // left vertical upper
  { x: 350, y: 100, w: 60,  h: 274 },   // right vertical upper
  { x: 210, y: 350, w: 60,  h: 320 },   // center vertical lower
  { x: 90,  y: 520, w: 210, h: 30 },    // bottom horizontal path
  { x: 300, y: 520, w: 150, h: 80 },    // bottom fire path
  { x: 180, y: 560, w: 120, h: 100 },   // volcano access
];

export const INTERACT_DISTANCE = 48;

export const EXITS = [
  { id: "dino_left_mid", edge: "left", x: 0, y: 350, w: 20, h: 44 },
];

export const ENTRIES = {
  from_farm_mid: { x: 6, y: 360 },
};

export const PLAYER_START = { x: 10, y: 360 };
