import { asset } from "./assets.js";

// World registry — defines all worlds and their connections.
// Connections are defined by EXITS in each layout file. Each exit has
// a unique id. The CONNECTION_MAP maps exitId → { world, entryId }.

export const WORLDS = {
  city: {
    id: "city",
    label: "Stad",
    bg: asset("/sprites/city-bg.png"),
    playerSprite: asset("/sprites/cyclist.png"),
    movementType: "cycle",
    fallbackColor: "#90c695",
  },
  launchpad: {
    id: "launchpad",
    label: "Lanceerplatform",
    bg: asset("/sprites/launchpad-bg.png"),
    playerSprite: asset("/sprites/cyclist.png"),
    movementType: "cycle",
    fallbackColor: "#636e72",
  },
  space: {
    id: "space",
    label: "Ruimte",
    bg: asset("/sprites/space-bg.png"),
    playerSprite: asset("/sprites/rocket.png"),
    movementType: "rocket",
    fallbackColor: "#0a0a2e",
  },
  farm: {
    id: "farm",
    label: "Boerderij",
    bg: asset("/sprites/farm-bg.png"),
    playerSprite: asset("/sprites/cyclist.png"),
    movementType: "cycle",
    fallbackColor: "#7ec850",
  },
  dino: {
    id: "dino",
    label: "Dino Jungle",
    bg: asset("/sprites/dino-bg.png"),
    playerSprite: asset("/sprites/cyclist.png"),
    movementType: "cycle",
    fallbackColor: "#2d5a27",
  },
};

// Maps each exit ID to its destination world + entry point.
// Exit IDs are defined in each layout's EXITS array.
// Entry IDs are defined in each layout's ENTRIES object.
export const CONNECTION_MAP = {
  // City exits
  "city_left_top":    { world: "launchpad", entryId: "from_city_top" },
  "city_left_mid":    { world: "launchpad", entryId: "from_city_mid" },
  "city_right_top":   { world: "farm",      entryId: "from_city_top" },
  "city_right_mid":   { world: "farm",      entryId: "from_city_mid" },

  // Launchpad exits
  "launchpad_right_top": { world: "city", entryId: "from_launchpad_top" },
  "launchpad_right_mid": { world: "city", entryId: "from_launchpad_mid" },

  // Farm exits
  "farm_left_top":    { world: "city", entryId: "from_farm_top" },
  "farm_left_mid":    { world: "city", entryId: "from_farm_mid" },
  "farm_right_mid":   { world: "dino", entryId: "from_farm_mid" },

  // Dino exits
  "dino_left_mid":    { world: "farm", entryId: "from_dino_mid" },
};

// Dynamically import a world's layout data
const layoutImports = {
  city:      () => import("./cityLayout"),
  launchpad: () => import("./launchpadLayout"),
  space:     () => import("./spaceLayout"),
  farm:      () => import("./farmLayout"),
  dino:      () => import("./dinoLayout"),
};

export async function loadWorldLayout(worldId) {
  const mod = await layoutImports[worldId]();
  return mod;
}
