// All positions in a 480x700 virtual coordinate space.
// x, y are CENTER coordinates for buildings.
// The canvas scales to fit the screen.

// Set to true to show building boxes, roads, walkable zones, and door markers
export const DEBUG_DRAW = false;

export const TILE_SIZE = 48;
export const CITY_W = 480;
export const CITY_H = 700;
export const PLAYER_SIZE = 32;

export const BUILDINGS = [
  {
    id: "woorden",
    label: "Station",
    emoji: "\uD83D\uDE89",
    x: 240, y: 55, w: 140, h: 90,
    color: "#45B7D1",
    roofColor: "#2980b9",
  },
  {
    id: "letters",
    label: "School",
    emoji: "\uD83C\uDFEB",
    x: 120, y: 240, w: 140, h: 120,
    color: "#A855F7",
    roofColor: "#7c3aed",
  },
  {
    id: "kleuren",
    label: "Verfwinkel",
    emoji: "\uD83C\uDFA8",
    x: 339, y: 192, w: 98, h: 64, // entered from the top road; front faces the theater
    color: "#a29bfe",
    roofColor: "#6c5ce7",
  },
  {
    id: "theater",
    label: "Theater",
    emoji: "\uD83C\uDFAD",
    x: 340, y: 290, w: 80, h: 70,
    color: "#e74c3c",
    roofColor: "#c0392b",
  },
  {
    id: "kinderopvang",
    label: "Cr\u00e8che",
    emoji: "\uD83D\uDC76",
    x: 420, y: 280, w: 70, h: 60,
    color: "#fd79a8",
    roofColor: "#e84393",
  },
  {
    id: "rekenen",
    label: "Markt",
    emoji: "\uD83C\uDFEA",
    x: 120, y: 470, w: 110, h: 100,
    color: "#FF9F43",
    roofColor: "#e67e22",
  },
  {
    id: "rijmen",
    label: "Haven",
    emoji: "\u2693",
    x: 360, y: 470, w: 110, h: 110,
    color: "#FF6B6B",
    roofColor: "#ee5a24",
  },
  {
    id: "garage",
    label: "Garage",
    emoji: "\uD83C\uDFC5",
    x: 240, y: 650, w: 80, h: 70,
    color: "#636e72",
    roofColor: "#2d3436",
  },
];

// Roads as rectangles (x, y, w, h) — used for collision
// Widened to 44px to accommodate visual variance in AI-generated sprites
export const ROADS = [
  { x: 0,   y: 120, w: 480, h: 44 },  // top horizontal
  { x: 0,   y: 350, w: 480, h: 44 },  // middle horizontal
  { x: 0,   y: 565, w: 370, h: 44 },  // bottom horizontal
  { x: 370, y: 470, w: 68,  h: 1 },  // steiger
  { x: 160, y: 600, w: 50,  h: 90 },  // garage toegang
  { x: 210, y: 70,  w: 60,  h: 700 }, // vertical center
];

// How close the player must be to a building door to trigger interaction
export const INTERACT_DISTANCE = 48;

// Exit zones — areas near map edges that trigger world transitions.
// Each exit has a unique id, a rectangle (x,y,w,h), and the edge it's on.
export const EXITS = [
  { id: "city_left_top",  edge: "left",  x: 0,   y: 110, w: 20, h: 70 },
  { id: "city_left_mid",  edge: "left",  x: 0,   y: 340, w: 20, h: 70 },
  { id: "city_right_top", edge: "right", x: 460, y: 110, w: 20, h: 70 },
  { id: "city_right_mid", edge: "right", x: 460, y: 340, w: 20, h: 70 },
];

// Entry points — named spawn positions where the player appears when
// arriving from another world. Keyed by entry ID.
export const ENTRIES = {
  from_launchpad_top: { x: 6,   y: 130 },
  from_launchpad_mid: { x: 6,   y: 360 },
  from_farm_top:      { x: 442, y: 130 },
  from_farm_mid:      { x: 442, y: 360 },
};

// Player start position (on the middle road, near center)
export const PLAYER_START = { x: 230, y: 360 };
