import { NPCS } from "../data/npcs";

const PAUSE_FRAMES = [50, 140]; // walkers pause at each point; traffic doesn't

const images = {}; // src → HTMLImageElement | null (missing sprite)

function loadImage(src) {
  if (src in images) return Promise.resolve(images[src]);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve((images[src] = img));
    img.onerror = () => resolve((images[src] = null));
    img.src = src;
  });
}

export function npcImage(n) {
  return images[n.sprite] || null;
}

// Creates the NPCs of a world; those without a sprite file are left out
export async function createNpcs(worldId) {
  const defs = NPCS[worldId] || [];
  await Promise.all(defs.map((d) => loadImage(d.sprite)));
  return defs
    .filter((d) => images[d.sprite])
    .map((def, i) => ({
      ...def,
      x: def.route[0].x,
      y: def.route[0].y,
      target: 1,
      step: 1,
      // Stagger traffic so not everyone enters at once
      pause: def.mode === "wrap" ? 60 + i * 140 : 30 + Math.floor(Math.random() * 90),
      frame: 0,
      dir: "down",
      moving: false,
    }));
}

function advanceTarget(n) {
  const last = n.route.length - 1;
  if (n.mode === "wrap") {
    if (n.target === last) {
      // Reappear at the start (off-screen) and wait a moment
      n.x = n.route[0].x;
      n.y = n.route[0].y;
      n.target = 1;
      n.pause = 120 + Math.floor(Math.random() * 240);
      return;
    }
    n.target++;
  } else if (n.mode === "loop") {
    n.target = (n.target + 1) % n.route.length;
  } else {
    if (n.target + n.step > last || n.target + n.step < 0) n.step *= -1;
    n.target += n.step;
    n.pause = PAUSE_FRAMES[0] + Math.floor(Math.random() * (PAUSE_FRAMES[1] - PAUSE_FRAMES[0]));
  }
}

// Moves every NPC one frame along its route
export function updateNpcs(npcs) {
  for (const n of npcs) {
    if (n.pause > 0) {
      n.pause--;
      n.moving = false;
      continue;
    }

    const t = n.route[n.target];
    const dx = t.x - n.x;
    const dy = t.y - n.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= n.speed) {
      n.x = t.x;
      n.y = t.y;
      advanceTarget(n);
      continue;
    }
    n.x += (dx / dist) * n.speed;
    n.y += (dy / dist) * n.speed;
    n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
    n.moving = true;
    n.frame++;
  }
}
