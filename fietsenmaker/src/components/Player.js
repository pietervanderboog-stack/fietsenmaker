const SPEED = 3;

export function createPlayer(startX, startY) {
  return {
    x: startX,
    y: startY,
    dir: "down",
    moving: false,
    frame: 0,
  };
}

// Returns null normally, or a transition event:
//   { type: "exit", exitId: "..." }
export function updatePlayer(player, keys, layout, movementType) {
  let dx = 0, dy = 0;
  if (keys.up)    { dy = -SPEED; player.dir = "up"; }
  if (keys.down)  { dy =  SPEED; player.dir = "down"; }
  if (keys.left)  { dx = -SPEED; player.dir = "left"; }
  if (keys.right) { dx =  SPEED; player.dir = "right"; }

  player.moving = dx !== 0 || dy !== 0;
  if (player.moving) player.frame++;

  const { CITY_W, PLAYER_SIZE } = layout;

  // Try X and Y movement separately for sliding along walls
  const nx = player.x + dx;
  const ny = player.y + dy;

  // Clamp to world edges so the player can always reach the boundary
  if (isWalkable(nx, player.y, layout, movementType)) {
    player.x = nx;
  } else if (dx < 0 && isWalkable(0, player.y, layout, movementType)) {
    player.x = 0;
  } else if (dx > 0 && isWalkable(CITY_W - PLAYER_SIZE, player.y, layout, movementType)) {
    player.x = CITY_W - PLAYER_SIZE;
  }
  if (isWalkable(player.x, ny, layout, movementType)) player.y = ny;

  // Check if player is inside any exit zone
  const exits = layout.EXITS || [];
  const cx = player.x + PLAYER_SIZE / 2;
  const cy = player.y + PLAYER_SIZE / 2;
  for (const exit of exits) {
    if (
      cx >= exit.x && cx < exit.x + exit.w &&
      cy >= exit.y && cy < exit.y + exit.h
    ) {
      // Only trigger if the player is actively moving toward the exit
      if (
        (exit.edge === "left" && dx < 0) ||
        (exit.edge === "right" && dx > 0) ||
        (exit.edge === "top" && dy < 0) ||
        (exit.edge === "bottom" && dy > 0)
      ) {
        return { type: "exit", exitId: exit.id };
      }
    }
  }

  return null;
}

export function isWalkable(x, y, layout, movementType) {
  const { CITY_W, CITY_H, PLAYER_SIZE, ROADS, BUILDINGS, INTERACT_DISTANCE } = layout;

  if (x < 0 || x > CITY_W - PLAYER_SIZE || y < 0 || y > CITY_H - PLAYER_SIZE) {
    return false;
  }

  // Rocket mode: free movement within bounds
  if (movementType === "rocket") {
    return true;
  }

  // Check if player overlaps any road
  for (const road of ROADS) {
    if (
      x + PLAYER_SIZE > road.x &&
      x < road.x + road.w &&
      y + PLAYER_SIZE > road.y &&
      y < road.y + road.h
    ) {
      return true;
    }
  }

  // Allow movement close to building doors (for entering)
  for (const b of BUILDINGS) {
    const doorX = b.x;
    const doorY = b.y + b.h / 2;
    const dist = Math.hypot(x + PLAYER_SIZE / 2 - doorX, y + PLAYER_SIZE / 2 - doorY);
    if (dist < INTERACT_DISTANCE + 24) return true;
  }

  return false;
}

export function getNearbyBuilding(player, layout) {
  const { BUILDINGS, INTERACT_DISTANCE, PLAYER_SIZE } = layout;
  for (const b of BUILDINGS) {
    const doorX = b.x;
    const doorY = b.y + b.h / 2;
    const dist = Math.hypot(
      player.x + PLAYER_SIZE / 2 - doorX,
      player.y + PLAYER_SIZE / 2 - doorY
    );
    if (dist < INTERACT_DISTANCE) return b;
  }
  return null;
}
