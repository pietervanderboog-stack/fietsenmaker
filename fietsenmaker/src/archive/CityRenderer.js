import { CITY_W, CITY_H, DEBUG_DRAW, BUILDINGS, ROADS, INTERACT_DISTANCE, PLAYER_SIZE } from "../data/cityLayout";

const sprites = {};

export function loadSprites() {
  const names = ["city-bg", "cyclist"];
  return Promise.all(
    names.map(
      (name) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => { sprites[name] = img; resolve(); };
          img.onerror = () => resolve(); // graceful fallback — draw shapes if missing
          img.src = `/sprites/${name}.png`;
        })
    )
  );
}

// Row index per direction in the cyclist spritesheet
const DIR_ROW = { down: 0, left: 1, right: 2, up: 3 };

export function drawCity(ctx, player, nearBuilding) {
  const { width, height } = ctx.canvas;

  // Cover: scale so city fills the entire viewport (no letterboxing)
  const scale = Math.max(width / CITY_W, height / CITY_H);

  // Viewport size in city coordinates
  const viewW = width / scale;
  const viewH = height / scale;

  // Camera: center on player, clamped so we never show outside the city
  const camX = Math.max(0, Math.min(CITY_W - viewW, player.x + 16 - viewW / 2));
  const camY = Math.max(0, Math.min(CITY_H - viewH, player.y + 16 - viewH / 2));

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-camX, -camY);

  // Background
  if (sprites["city-bg"]) {
    ctx.drawImage(sprites["city-bg"], 0, 0, CITY_W, CITY_H);
  } else {
    ctx.fillStyle = "#90c695";
    ctx.fillRect(0, 0, CITY_W, CITY_H);
  }

  // Debug overlays
  if (DEBUG_DRAW) {
    // Roads (green, semi-transparent)
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
      // Label
      ctx.fillStyle = "rgba(255, 0, 0, 0.9)";
      ctx.fillText(`${b.label} (${b.id})`, b.x, by - 4);
      ctx.fillStyle = "rgba(255, 0, 0, 0.12)";

      // Door marker (yellow circle at bottom-center of building)
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

      // Interact radius around door
      ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(doorX, doorY, INTERACT_DISTANCE, 0, Math.PI * 2);
      ctx.stroke();

      // Walkable radius around door
      ctx.strokeStyle = "rgba(0, 200, 0, 0.3)";
      ctx.beginPath();
      ctx.arc(doorX, doorY, INTERACT_DISTANCE + 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    ctx.restore();

    // City boundary
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 0, 0.6)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(0, 0, CITY_W, CITY_H);
    ctx.setLineDash([]);
    ctx.restore();

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

  // Player sprite
  const animFrame = player.moving ? Math.floor(player.frame / 6) % 4 : 0;
  const bob = player.moving ? Math.sin(player.frame * 0.3) * 1 : 0;

  if (sprites["cyclist"]) {
    // For "right" direction, mirror the left-facing row instead of using the right row
    // directly — avoids AI spritesheet inconsistencies where some right frames face left.
    const srcRow = player.dir === "right" ? DIR_ROW.left : (DIR_ROW[player.dir] ?? 0);
    const flipH = player.dir === "right";

    ctx.save();
    if (flipH) {
      ctx.translate(player.x + 32, player.y + bob);
      ctx.scale(-1, 1);
      ctx.drawImage(sprites["cyclist"], animFrame * 32, srcRow * 32, 32, 32, 0, 0, 32, 32);
    } else {
      ctx.drawImage(sprites["cyclist"], animFrame * 32, srcRow * 32, 32, 32, player.x, player.y + bob, 32, 32);
    }
    ctx.restore();
  } else {
    // Emoji fallback
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.save();
    if (player.dir === "left") ctx.scale(-1, 1);
    const px = player.dir === "left" ? -(player.x + 16) : player.x + 16;
    ctx.fillText("\uD83D\uDEB4", px, player.y + 24 + bob);
    ctx.restore();
    ctx.textAlign = "start";
  }

  ctx.restore();
}

// Returns the current camera transform so callers can convert screen coords to city coords
export function getCityTransform(canvas, player) {
  const scale = Math.max(canvas.width / CITY_W, canvas.height / CITY_H);
  const viewW = canvas.width / scale;
  const viewH = canvas.height / scale;
  const camX = Math.max(0, Math.min(CITY_W - viewW, player.x + 16 - viewW / 2));
  const camY = Math.max(0, Math.min(CITY_H - viewH, player.y + 16 - viewH / 2));
  return { scale, camX, camY };
}
