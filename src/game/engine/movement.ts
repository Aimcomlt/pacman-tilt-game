import { Direction, GhostState, MapDefinition, PlayerState, Position } from './types';
import { chooseDirection } from './ghostAI';

const directionVectors: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  none: { x: 0, y: 0 },
};

function normalizePosition(position: Position): Position {
  return { x: parseFloat(position.x.toFixed(3)), y: parseFloat(position.y.toFixed(3)) };
}

export function isWall(position: Position, map: MapDefinition): boolean {
  const x = Math.round(position.x);
  const y = Math.round(position.y);
  if (x < 0 || y < 0 || y >= map.height || x >= map.width) return true;
  return map.tiles[y][x] === 'wall';
}

function canMove(position: Position, direction: Direction, map: MapDefinition): boolean {
  if (direction === 'none') return false;
  const vector = directionVectors[direction];
  const target = { x: position.x + vector.x, y: position.y + vector.y };
  return !isWall(target, map);
}

function advance(position: Position, direction: Direction, speed: number): Position {
  const vector = directionVectors[direction];
  return normalizePosition({ x: position.x + vector.x * speed, y: position.y + vector.y * speed });
}

export function movePlayer(state: PlayerState, map: MapDefinition, desired: Direction): PlayerState {
  const prefersDesired = desired !== 'none' && canMove(state.position, desired, map);
  const activeDirection = prefersDesired ? desired : state.direction;
  const canContinue = canMove(state.position, activeDirection, map);
  const nextPosition = canContinue ? advance(state.position, activeDirection, state.speed) : state.position;
  return {
    ...state,
    direction: activeDirection,
    pendingDirection: desired,
    position: nextPosition,
  };
}

export function moveGhost(ghost: GhostState, playerTarget: Position, map: MapDefinition): GhostState {
  const direction = chooseDirection(ghost, playerTarget, map);
  const canContinue = direction !== 'none' && canMove(ghost.position, direction, map);
  const nextPosition = canContinue ? advance(ghost.position, direction, ghost.speed) : ghost.position;
  return {
    ...ghost,
    direction: direction === 'none' ? ghost.direction : direction,
    position: nextPosition,
  };
}

export function availableDirections(position: Position, map: MapDefinition): Direction[] {
  return (['up', 'down', 'left', 'right'] as Direction[]).filter((direction) => canMove(position, direction, map));
}
