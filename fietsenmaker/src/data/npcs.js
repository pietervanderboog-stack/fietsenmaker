// Characters that move around each world, drawn from 128×128 spritesheets
// (4×4 frames of 32px, same layout as the player).
//
// Coordinates use the player convention (top-left of a 32×32 box), so every
// on-map waypoint must be rideable — `npm run check:layout` verifies that.
// Points outside the world (x < 0 or > 448) are off-screen entry/exit points.
//
// route modes:
//   "wrap"     ride to the last point, then reappear at the first (traffic)
//   "loop"     go round: last point connects back to the first
//   "pingpong" walk back and forth
//
// NPCs whose sprite file doesn't exist yet are simply not drawn, so new
// characters can be added here before their sprite is made.
// Generate sprites with the prompt in SPRITES-PROMPT.md, then run
//   python scripts/prepare-sprite.py <gemini-output.png> npc-<naam>
import { asset } from "./assets.js";

const S = asset("sprites/");

// Row order in the spritesheet per kind (the player cyclist faces left in
// row 1 and is mirrored for right; the rocket has its own order)
export const SHEETS = {
  cyclist: { rows: { down: 0, left: 1, right: 1, up: 3 }, mirrorRight: true },
  rocket: { rows: { up: 0, left: 1, right: 2, down: 3 }, mirrorRight: false },
  walker: { rows: { down: 0, left: 1, right: 2, up: 3 }, mirrorRight: false },
};

export const NPCS = {
  city: [
    {
      id: "fietser-blauw", sprite: S + "npc-fietser-blauw.png", sheet: "cyclist", speed: 1.5, mode: "wrap",
      route: [{ x: -40, y: 126 }, { x: 490, y: 126 }],
      lines: ["Tring tring! Hoi!", "Ik fiets naar het station!"],
    },
    {
      id: "fietser-groen", sprite: S + "npc-fietser-groen.png", sheet: "cyclist", speed: 1.3, mode: "wrap",
      route: [{ x: 490, y: 356 }, { x: 224, y: 356 }, { x: 224, y: 571 }, { x: -40, y: 571 }],
      lines: ["Tring tring!", "In de winkel kun je rekenen!"],
    },
    {
      id: "fietser-paars", sprite: S + "npc-fietser-paars.png", sheet: "cyclist", speed: 1.4, mode: "wrap",
      route: [{ x: 224, y: 710 }, { x: 224, y: 126 }, { x: -40, y: 126 }],
      lines: ["Hoi! Ga jij ook naar school?", "Tring tring!"],
    },
    {
      id: "wandelaar", sprite: S + "npc-wandelaar.png", sheet: "walker", speed: 0.45, mode: "pingpong",
      route: [{ x: 40, y: 356 }, { x: 180, y: 356 }],
      lines: ["Dag! In het theater spelen ze een verhaal.", "Wat een mooie fiets heb jij!"],
    },
    {
      id: "hardloper", sprite: S + "npc-hardloper.png", sheet: "walker", speed: 1.1, mode: "wrap",
      route: [{ x: 490, y: 126 }, { x: -40, y: 126 }],
      lines: ["Hijg... ik ren elke dag een rondje!"],
    },
  ],
  launchpad: [
    {
      id: "fietser-paars", sprite: S + "npc-fietser-paars.png", sheet: "cyclist", speed: 1.4, mode: "wrap",
      route: [{ x: 490, y: 182 }, { x: 202, y: 182 }, { x: 202, y: 430 }, { x: 490, y: 430 }],
      lines: ["Tring tring! Ga jij ook naar de ruimte?"],
    },
    {
      id: "hond", sprite: S + "npc-hond.png", sheet: "walker", speed: 0.9, mode: "pingpong",
      route: [{ x: 90, y: 562 }, { x: 330, y: 562 }],
      lines: ["Woef! Woef!"],
    },
  ],
  space: [
    {
      id: "raket-groen", sprite: S + "npc-raket-groen.png", sheet: "rocket", speed: 1.2, mode: "loop",
      route: [{ x: 60, y: 260 }, { x: 300, y: 250 }, { x: 420, y: 470 }, { x: 150, y: 560 }],
      lines: ["Hallo! Ik vlieg een rondje om Jupiter!"],
    },
    {
      id: "raket-paars", sprite: S + "npc-raket-paars.png", sheet: "rocket", speed: 0.9, mode: "loop",
      route: [{ x: 400, y: 320 }, { x: 200, y: 380 }, { x: 60, y: 120 }, { x: 330, y: 60 }],
      lines: ["Bij het ruimtestation kun je tanken!"],
    },
  ],
  farm: [
    {
      id: "fietser-oranje", sprite: S + "npc-fietser-oranje.png", sheet: "cyclist", speed: 1.3, mode: "wrap",
      route: [{ x: -40, y: 320 }, { x: 490, y: 320 }],
      lines: ["Tring tring! Tel jij de koeien?"],
    },
    {
      id: "fietser-blauw", sprite: S + "npc-fietser-blauw.png", sheet: "cyclist", speed: 1.2, mode: "wrap",
      route: [{ x: 490, y: 596 }, { x: -40, y: 596 }],
      lines: ["Hoi! In de kas groeien bloemen."],
    },
    {
      id: "kip", sprite: S + "npc-kip.png", sheet: "walker", speed: 0.6, mode: "pingpong",
      route: [{ x: 160, y: 320 }, { x: 330, y: 320 }],
      lines: ["Tok tok!"],
    },
    {
      id: "koe", sprite: S + "npc-koe.png", sheet: "walker", speed: 0.3, mode: "pingpong",
      route: [{ x: 224, y: 400 }, { x: 224, y: 520 }],
      lines: ["Boe! Tel jij ons in de stal?"],
    },
  ],
  dino: [
    {
      id: "fietser-groen", sprite: S + "npc-fietser-groen.png", sheet: "cyclist", speed: 1.3, mode: "wrap",
      route: [{ x: -40, y: 346 }, { x: 224, y: 346 }, { x: 224, y: 500 }, { x: 224, y: 346 }, { x: 490, y: 346 }],
      lines: ["Tring tring! Pas op voor de dino's!"],
    },
    {
      id: "babydino", sprite: S + "npc-babydino.png", sheet: "walker", speed: 0.8, mode: "pingpong",
      route: [{ x: 364, y: 346 }, { x: 364, y: 160 }],
      lines: ["Rawr! Ik ben nog klein."],
    },
  ],
};
