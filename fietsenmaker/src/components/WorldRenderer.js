import { DEBUG } from "../data/debug";
import { npcImage } from "./Npcs";
import { SHEETS } from "../data/npcs";

// Sprite cache keyed by world ID
const spriteCache = {};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function loadWorldSprites(worldDef) {
  if (spriteCache[worldDef.id]) return spriteCache[worldDef.id];

  const [bg, player] = await Promise.all([
    loadImage(worldDef.bg),
    loadImage(worldDef.playerSprite),
  ]);

  spriteCache[worldDef.id] = { bg, player };
  return spriteCache[worldDef.id];
}

// Row index per direction in spritesheets
const DIR_ROW = { down: 0, left: 1, right: 2, up: 3 };
// Rocket sprite has different row order: 0=up, 1=left, 2=right, 3=down
const ROCKET_DIR_ROW = { up: 0, left: 1, right: 2, down: 3 };

export function drawWorld(ctx, player, nearBuilding, worldDef, layout, npcs = []) {
  const { CITY_W, CITY_H, DEBUG_DRAW, BUILDINGS, ROADS, INTERACT_DISTANCE, PLAYER_SIZE } = layout;
  const sprites = spriteCache[worldDef.id] || {};
  const { width, height } = ctx.canvas;

  // Cover: scale so world fills the entire viewport
  const scale = Math.max(width / CITY_W, height / CITY_H);
  const viewW = width / scale;
  const viewH = height / scale;

  // Camera: center on player, clamped within bounds
  const camX = Math.max(0, Math.min(CITY_W - viewW, player.x + 16 - viewW / 2));
  const camY = Math.max(0, Math.min(CITY_H - viewH, player.y + 16 - viewH / 2));

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-camX, -camY);

  // Background
  if (sprites.bg) {
    ctx.drawImage(sprites.bg, 0, 0, CITY_W, CITY_H);
  } else {
    ctx.fillStyle = worldDef.fallbackColor || "#90c695";
    ctx.fillRect(0, 0, CITY_W, CITY_H);
  }

  // Debug overlays
  if (DEBUG_DRAW || DEBUG) {
    drawDebugOverlays(ctx, layout);
    // Player hitbox
    ctx.save();
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 1;
    ctx.strokeRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.restore();
  }

  // Gold glow around nearby building
  if (nearBuilding) {
    const b = nearBuilding;
    ctx.save();
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 12;
    ctx.strokeStyle = "rgba(255, 215, 0, 0.85)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(b.x - b.w / 2 - 4, b.y - b.h / 2 - 8, b.w + 8, b.h + 12, 8);
    ctx.stroke();
    ctx.restore();
  }

  // Draw exit arrows at exit zones
  drawExitArrows(ctx, layout);

  drawNpcs(ctx, npcs);

  // Player sprite
  const animFrame = player.moving ? Math.floor(player.frame / 6) % 4 : 0;
  const bob = player.moving ? Math.sin(player.frame * 0.3) * 1 : 0;

  if (sprites.player) {
    const isRocket = worldDef.movementType === "rocket";
    const dirMap = isRocket ? ROCKET_DIR_ROW : DIR_ROW;
    const srcRow = !isRocket && player.dir === "right" ? dirMap.left : (dirMap[player.dir] ?? 0);
    const flipH = !isRocket && player.dir === "right";

    ctx.save();
    if (flipH) {
      ctx.translate(player.x + 32, player.y + bob);
      ctx.scale(-1, 1);
      ctx.drawImage(sprites.player, animFrame * 32, srcRow * 32, 32, 32, 0, 0, 32, 32);
    } else {
      ctx.drawImage(sprites.player, animFrame * 32, srcRow * 32, 32, 32, player.x, player.y + bob, 32, 32);
    }
    ctx.restore();
  } else {
    // Emoji fallback
    const emoji = worldDef.movementType === "rocket" ? "\uD83D\uDE80" : "\uD83D\uDEB4";
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.save();
    if (player.dir === "left") ctx.scale(-1, 1);
    const px = player.dir === "left" ? -(player.x + 16) : player.x + 16;
    ctx.fillText(emoji, px, player.y + 24 + bob);
    ctx.restore();
    ctx.textAlign = "start";
  }


  ctx.restore();
}

function drawNpcs(ctx, npcs) {
  for (const n of npcs) {
    const img = npcImage(n);
    if (!img) continue;
    const sheet = SHEETS[n.sheet];
    const frame = n.moving ? Math.floor(n.frame / 6) % 4 : 0;
    const row = sheet.rows[n.dir] ?? 0;
    const mirror = sheet.mirrorRight && n.dir === "right";
    ctx.save();
    if (mirror) {
      ctx.translate(n.x + 32, n.y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, frame * 32, row * 32, 32, 32, 0, 0, 32, 32);
    } else {
      ctx.drawImage(img, frame * 32, row * 32, 32, 32, n.x, n.y, 32, 32);
    }
    ctx.restore();
  }
}

function drawExitArrows(ctx, layout) {
  const exits = layout.EXITS || [];
  if (exits.length === 0) return;

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.7)";

  for (const exit of exits) {
    const cy = exit.y + exit.h / 2;
    const cx = exit.x + exit.w / 2;

    ctx.beginPath();
    if (exit.edge === "left") {
      ctx.moveTo(14, cy);
      ctx.lineTo(26, cy - 10);
      ctx.lineTo(26, cy + 10);
    } else if (exit.edge === "right") {
      const { CITY_W } = layout;
      ctx.moveTo(CITY_W - 14, cy);
      ctx.lineTo(CITY_W - 26, cy - 10);
      ctx.lineTo(CITY_W - 26, cy + 10);
    } else if (exit.edge === "top") {
      ctx.moveTo(cx, 14);
      ctx.lineTo(cx - 10, 26);
      ctx.lineTo(cx + 10, 26);
    } else if (exit.edge === "bottom") {
      const { CITY_H } = layout;
      ctx.moveTo(cx, CITY_H - 14);
      ctx.lineTo(cx - 10, CITY_H - 26);
      ctx.lineTo(cx + 10, CITY_H - 26);
    }
    ctx.fill();
  }

  ctx.restore();
}

function drawDebugOverlays(ctx, layout) {
  const { CITY_W, CITY_H, BUILDINGS, ROADS, INTERACT_DISTANCE, PLAYER_SIZE } = layout;

  // Roads (green)
  ctx.save();
  ctx.fillStyle = "rgba(0, 200, 0, 0.25)";
  ctx.strokeStyle = "rgba(0, 200, 0, 0.8)";
  ctx.lineWidth = 1;
  for (const r of ROADS) {
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
  }
  ctx.restore();

  // Buildings (red outline + label)
  ctx.save();
  ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
  ctx.fillStyle = "rgba(255, 0, 0, 0.12)";
  ctx.lineWidth = 2;
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  for (const b of BUILDINGS) {
    const bx = b.x - b.w / 2;
    const by = b.y - b.h / 2;
    ctx.fillRect(bx, by, b.w, b.h);
    ctx.strokeRect(bx, by, b.w, b.h);
    ctx.fillStyle = "rgba(255, 0, 0, 0.9)";
    ctx.fillText(`${b.label} (${b.id})`, b.x, by - 4);
    ctx.fillStyle = "rgba(255, 0, 0, 0.12)";

    const doorX = b.x;
    const doorY = b.y + b.h / 2;
    ctx.save();
    ctx.fillStyle = "rgba(255, 215, 0, 0.8)";
    ctx.strokeStyle = "rgba(255, 165, 0, 1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(doorX, doorY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(doorX, doorY, INTERACT_DISTANCE, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(0, 200, 0, 0.3)";
    ctx.beginPath();
    ctx.arc(doorX, doorY, INTERACT_DISTANCE + 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  ctx.restore();

  // Exit zones (orange)
  const exits = layout.EXITS || [];
  ctx.save();
  ctx.fillStyle = "rgba(255, 165, 0, 0.3)";
  ctx.strokeStyle = "rgba(255, 165, 0, 0.9)";
  ctx.lineWidth = 2;
  ctx.font = "bold 8px monospace";
  ctx.textAlign = "center";
  for (const exit of exits) {
    ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
    ctx.strokeRect(exit.x, exit.y, exit.w, exit.h);
    ctx.fillStyle = "rgba(255, 165, 0, 0.9)";
    ctx.fillText(exit.id, exit.x + exit.w / 2, exit.y - 4);
    ctx.fillStyle = "rgba(255, 165, 0, 0.3)";
  }
  ctx.restore();

  // World boundary
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 0, 0.6)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.strokeRect(0, 0, CITY_W, CITY_H);
  ctx.setLineDash([]);
  ctx.restore();
}

export function getWorldTransform(canvas, player, layout) {
  const { CITY_W, CITY_H } = layout;
  const scale = Math.max(canvas.width / CITY_W, canvas.height / CITY_H);
  const viewW = canvas.width / scale;
  const viewH = canvas.height / scale;
  const camX = Math.max(0, Math.min(CITY_W - viewW, player.x + 16 - viewW / 2));
  const camY = Math.max(0, Math.min(CITY_H - viewH, player.y + 16 - viewH / 2));
  return { scale, camX, camY };
}
