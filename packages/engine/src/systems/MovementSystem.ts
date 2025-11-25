import { MapSchema, Ruleset } from '@pacman/shared';
import { GameState } from '..';

const clampVelocity = (value: number, max: number) => Math.max(-max, Math.min(max, value));

const isWall = (map: MapSchema, x: number, y: number) => map.tiles[y]?.[x] === 1;

const withinBounds = (map: MapSchema, x: number, y: number) => x >= 0 && y >= 0 && x < map.width && y < map.height;

const resolveAxisMovement = (
  position: number,
  movement: number,
  fixedCoord: number,
  map: MapSchema,
  axis: 'x' | 'y',
): number => {
  let next = position;
  let remaining = movement;
  const stepDirection = Math.sign(remaining);
  const stepSize = 0.5;

  while (Math.abs(remaining) > 1e-6) {
    const step = Math.min(Math.abs(remaining), stepSize) * stepDirection;
    const candidate = next + step;
    const x = axis === 'x' ? Math.round(candidate) : Math.round(fixedCoord);
    const y = axis === 'y' ? Math.round(candidate) : Math.round(fixedCoord);

    if (!withinBounds(map, x, y) || isWall(map, x, y)) break;

    next = candidate;
    remaining -= step;
  }

  return next;
};

export const MovementSystem = {
  integrate(state: GameState, map: MapSchema, rules: Ruleset, delta: number) {
    const tilt = state.inputs.tilt?.normalized ?? { x: 0, y: 0 };
    const speed = 0.002 * rules.tickRate;
    const vx = clampVelocity(state.player.velocity.x + tilt.x * speed, 1);
    const vy = clampVelocity(state.player.velocity.y + tilt.y * speed, 1);

    const deltaSeconds = delta / 1000;
    state.player.velocity = { x: vx, y: vy };
    const dx = state.player.velocity.x * deltaSeconds;
    const dy = state.player.velocity.y * deltaSeconds;
    const nextX = resolveAxisMovement(state.player.position.x, dx, state.player.position.y, map, 'x');
    const nextY = resolveAxisMovement(state.player.position.y, dy, nextX, map, 'y');

    state.player.position = { x: nextX, y: nextY };
  },
};
