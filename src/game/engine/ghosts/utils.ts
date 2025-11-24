import { PlayerState, Position } from '../types';

const directionVectors: Record<PlayerState['direction'], Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  none: { x: 0, y: 0 },
};

export function clampToMap(position: Position, width: number, height: number): Position {
  return {
    x: Math.max(0, Math.min(Math.round(position.x), width - 1)),
    y: Math.max(0, Math.min(Math.round(position.y), height - 1)),
  };
}

export function tilesAhead(player: PlayerState, tiles: number): Position {
  const vector = directionVectors[player.direction];
  return {
    x: player.position.x + vector.x * tiles,
    y: player.position.y + vector.y * tiles,
  };
}

export function manhattan(a: Position, b: Position): number {
  return Math.abs(Math.round(a.x) - Math.round(b.x)) + Math.abs(Math.round(a.y) - Math.round(b.y));
}
