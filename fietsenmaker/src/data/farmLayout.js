// Farm world — agricultural landscape with fields and paths
export const DEBUG_DRAW = false;

export const TILE_SIZE = 48;
export const CITY_W = 480;
export const CITY_H = 700;
export const PLAYER_SIZE = 32;

export const BUILDINGS = [
  {
    id: "farm_doolhof",
    label: "Maisveld",
    emoji: "\uD83C\uDF3D",
    x: 113, y: 167, w: 190, h: 130,
    color: "#fdcb6e",
    roofColor: "#f39c12",
  },
  {
    id: "farm_boomgaard",
    label: "Boomgaard",
    emoji: "\uD83C\uDF4E",
    x: 370, y: 160, w: 200, h: 160,
    color: "#00b894",
    roofColor: "#00cec9",
  },
  {
    id: "farm_dieren",
    label: "Stal",
    emoji: "\uD83D\uDC04",
    x: 240, y: 290, w: 90, h: 100,
    color: "#e17055",
    roofColor: "#d63031",
  },
  {
    id: "farm_oogst",
    label: "Moestuin",
    emoji: "\uD83E\uDD55",
    x: 380, y: 530, w: 170, h: 120,
    color: "#55efc4",
    roofColor: "#00b894",
  },
  {
    id: "farm_zaadjes",
    label: "Kas",
    emoji: "\uD83C\uDF31",
    x: 240, y: 620, w: 120, h: 120,
    color: "#81ecec",
    roofColor: "#00cec9",
  },
];

export const ROADS = [
  { x: 0,   y: 70, w: 270, h: 15 },  // top horizontal (from city, dead-ends at boomgaard)
  { x: 0,   y: 335, w: 480, h: 15 },  // middle horizontal
  { x: 210, y: 80, w: 60,  h: 170 }, // center vertical upper
  { x: 210, y: 350, w: 60,  h: 210 }, // center vertical lower
  { x: 120, y: 240, w: 35,  h: 100 }, // middle left vertical
  { x: 355, y: 240, w: 35,  h: 100 }, // middle right vertical
  { x: 160, y: 550, w: 35,  h: 150 }, // low left vertical
  { x: 285, y: 550, w: 35,  h: 150 }, // lowe right vertical
  { x: 120,  y: 240, w: 270, h: 15 },  //middle horizontal short
  { x: 0,   y: 610, w: 480, h: 15 },  // bottom path
  { x: 160,  y: 550, w: 160, h: 15 }  //lower horizontal short
];

export const INTERACT_DISTANCE = 48;

export const EXITS = [
  { id: "farm_left_top",  edge: "left",  x: 0,   y: 60, w: 20, h: 44 },
  { id: "farm_left_mid",  edge: "left",  x: 0,   y: 320, w: 20, h: 44 },
  { id: "farm_right_mid", edge: "right", x: 460, y: 320, w: 20, h: 44 },
];

export const ENTRIES = {
  from_city_top:  { x: 6,   y: 60 },
  from_city_mid:  { x: 6,   y: 320 },
  from_dino_mid:  { x: 442, y: 320 },
};

export const PLAYER_START = { x: 40, y: 320 };
