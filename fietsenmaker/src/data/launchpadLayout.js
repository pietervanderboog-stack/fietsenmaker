// Launchpad world — transition zone between city and space
export const DEBUG_DRAW = false;

export const TILE_SIZE = 48;
export const CITY_W = 480;
export const CITY_H = 700;
export const PLAYER_SIZE = 32;

export const BUILDINGS = [
  {
    id: "rocket",
    label: "Raket",
    emoji: "\uD83D\uDE80",
    x: 95, y: 320, w: 70, h: 140,
    color: "#e74c3c",
    roofColor: "#c0392b",
    special: "rocketLaunch",
  },
  {
    id: "controlecentrum",
    label: "Controle",
    emoji: "\uD83D\uDDA5\uFE0F",
    x: 347, y: 320, w: 140, h: 150,
    color: "#636e72",
    roofColor: "#2d3436",
  },
];

// Measured from launchpad-bg.png pixel strips (asphalt / dirt edges)
export const ROADS = [
  { x: 0,   y: 172, w: 480, h: 52 },  // top road (full width) → exits right to city
  { x: 188, y: 420, w: 292, h: 52 },  // middle road → exits right to city
  { x: 188, y: 172, w: 60,  h: 300 }, // vertical connector
  { x: 60,  y: 320, w: 164, h: 35 },  // launch pad → vertical road
  { x: 76,  y: 300, w: 36,  h: 290 }, // dirt path from rocket down
  { x: 76,  y: 560, w: 292, h: 35 },  // dirt path to the scientists
  { x: 334, y: 468, w: 34,  h: 110 }, // dirt path up to the middle road
];

export const INTERACT_DISTANCE = 48;

export const EXITS = [
  { id: "launchpad_right_top", edge: "right", x: 460, y: 150, w: 20, h: 90 },
  { id: "launchpad_right_mid", edge: "right", x: 460, y: 395, w: 20, h: 90 },
];

export const ENTRIES = {
  from_city_top: { x: 442, y: 170 },
  from_city_mid: { x: 442, y: 430 },
  from_space:    { x: 150, y: 322 }, // next to the rocket on the pad
};

export const PLAYER_START = { x: 300, y: 182 };
