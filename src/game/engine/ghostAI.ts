import { availableDirections } from './movement';
import { Direction, GhostState, MapDefinition, Position } from './types';

function opposite(direction: Direction): Direction {
  switch (direction) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    default:
      return 'none';
  }
}

function distance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function chooseBestDirection(options: Direction[], ghost: GhostState, target: Position): Direction {
  if (options.length === 0) return 'none';
  const scored = options.map((direction) => {
    const projected: Position = {
      x: ghost.position.x + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0),
      y: ghost.position.y + (direction === 'up' ? -1 : direction === 'down' ? 1 : 0),
    };
    return { direction, score: distance(projected, target) };
  });
  return scored.sort((a, b) => a.score - b.score)[0]?.direction ?? 'none';
}

export function chooseDirection(ghost: GhostState, target: Position, map: MapDefinition): Direction {
  const options = availableDirections(ghost.position, map).filter(
    (direction) => direction !== opposite(ghost.direction)
  );

  if (ghost.mode === 'scatter') {
    return options[0] ?? 'none';
  }

  if (ghost.mode === 'frightened') {
    return options.reverse()[0] ?? 'none';
  }

  return chooseBestDirection(options, ghost, target);
}
