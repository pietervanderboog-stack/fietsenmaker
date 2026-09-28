// Checks every world layout with the real player movement code.
// Usage: npm run check:layout   (exit code 1 when problems are found)
//
// For cycle worlds it flood-fills all positions a player can reach from
// every spawn point and reports:
//   - spawns that are stuck or sit inside an exit zone
//   - doors and exits that can't be reached
//   - doors so close together that one building "steals" the other
//   - exits without a connection, or connections to missing entries
// For rocket worlds (free movement) it checks bounds and overlap.
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src");
const load = (p) => import(pathToFileURL(path.join(root, p)).href);

const { WORLDS, CONNECTION_MAP } = await load("data/worlds.js");
const { updatePlayer, isWalkable } = await load("components/Player.js");
const { NPCS } = await load("data/npcs.js");

const DIRS = ["up", "down", "left", "right"];
const doorOf = (b) => ({ x: b.x, y: b.y + b.h / 2 });
const inRect = (px, py, r) => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;

function step(pos, dir, L, movementType) {
  const p = { ...pos, dir: "down", moving: false, frame: 0 };
  const ev = updatePlayer(p, { [dir]: true }, L, movementType);
  return { x: p.x, y: p.y, ev };
}

let total = 0;

for (const [worldId, def] of Object.entries(WORLDS)) {
  const L = await load(`data/${worldId}Layout.js`);
  const issues = [];
  const half = L.PLAYER_SIZE / 2;
  const spawns = { PLAYER_START: L.PLAYER_START, ...L.ENTRIES };

  for (const b of L.BUILDINGS) {
    if (b.x - b.w / 2 < 0 || b.x + b.w / 2 > L.CITY_W || b.y - b.h / 2 < 0 || b.y + b.h / 2 > L.CITY_H) {
      issues.push(`building ${b.id} sticks out of the world`);
    }
  }

  for (const e of L.EXITS) {
    const c = CONNECTION_MAP[e.id];
    if (!c) { issues.push(`exit ${e.id} has no CONNECTION_MAP entry`); continue; }
    const T = await load(`data/${c.world}Layout.js`);
    if (!T.ENTRIES?.[c.entryId]) issues.push(`exit ${e.id} points to missing entry ${c.world}.${c.entryId}`);
  }

  for (const a of L.BUILDINGS) {
    for (const b of L.BUILDINGS) {
      if (a.id >= b.id) continue;
      const d = Math.hypot(doorOf(a).x - doorOf(b).x, doorOf(a).y - doorOf(b).y);
      if (d < L.INTERACT_DISTANCE * 1.5) {
        issues.push(`doors ${a.id} & ${b.id} are ${d.toFixed(0)}px apart (interact radius ${L.INTERACT_DISTANCE})`);
      }
    }
  }

  if (def.movementType === "cycle") {
    const seen = new Set();
    const queue = [];
    const key = (p) => `${p.x},${p.y}`;

    for (const [name, s] of Object.entries(spawns)) {
      for (const e of L.EXITS) {
        if (inRect(s.x + half, s.y + half, e)) issues.push(`spawn ${name} lies inside exit ${e.id}`);
      }
      const moves = DIRS.map((d) => step(s, d, L, "cycle"));
      if (moves.every((m) => m.x === s.x && m.y === s.y)) {
        issues.push(`spawn ${name} (${s.x},${s.y}) is stuck — not on a road`);
      }
      if (!seen.has(key(s))) { seen.add(key(s)); queue.push({ x: s.x, y: s.y }); }
    }

    const exitsHit = new Set();
    const doorsHit = new Set();
    while (queue.length) {
      const c = queue.shift();
      for (const b of L.BUILDINGS) {
        const door = doorOf(b);
        if (Math.hypot(c.x + half - door.x, c.y + half - door.y) < L.INTERACT_DISTANCE) doorsHit.add(b.id);
      }
      for (const d of DIRS) {
        const n = step(c, d, L, "cycle");
        if (n.ev) exitsHit.add(n.ev.exitId);
        if (!seen.has(key(n))) { seen.add(key(n)); queue.push({ x: n.x, y: n.y }); }
      }
    }

    for (const b of L.BUILDINGS) if (!doorsHit.has(b.id)) issues.push(`door of ${b.id} is unreachable`);
    for (const e of L.EXITS) if (!exitsHit.has(e.id)) issues.push(`exit ${e.id} is unreachable`);
  } else {
    for (const a of L.BUILDINGS) {
      for (const b of L.BUILDINGS) {
        if (a.id >= b.id) continue;
        const overlap = Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;
        if (overlap) issues.push(`objects ${a.id} & ${b.id} overlap`);
      }
    }
  }

  // NPC routes: every point along every leg must be rideable
  for (const npc of NPCS[worldId] || []) {
    const r = npc.route;
    for (let i = 0; i < r.length; i++) {
      const a = r[i];
      const b = r[Math.min(i + 1, r.length - 1)];
      const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 4));
      for (let k = 0; k <= steps; k++) {
        const x = Math.round(a.x + ((b.x - a.x) * k) / steps);
        const y = Math.round(a.y + ((b.y - a.y) * k) / steps);
        const offMap = x < 0 || y < 0 || x > L.CITY_W - L.PLAYER_SIZE || y > L.CITY_H - L.PLAYER_SIZE;
        if (!offMap && !isWalkable(x, y, L, def.movementType)) {
          issues.push(`npc ${npc.id} walks off the road near (${x},${y})`);
          k = steps;
          i = r.length;
        }
      }
    }
  }

  total += issues.length;
  console.log(`${issues.length ? "✗" : "✓"} ${worldId}`);
  for (const i of issues) console.log(`    ${i}`);
}

if (total) {
  console.log(`\n${total} problem(s). Visual check: npm run shots → debug/*.png`);
  process.exit(1);
}
