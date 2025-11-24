import { bestNeighborTowardTarget, distanceBetween, nearestWalkable, positionKey } from './mapGraphBuilder';
import { Direction, MapDefinition, Position } from './types';

function clampPosition(position: Position, width: number, height: number): Position {
  return {
    x: Math.max(0, Math.min(Math.round(position.x), width - 1)),
    y: Math.max(0, Math.min(Math.round(position.y), height - 1)),
  };
}

function resolveToWalkable(position: Position, map: MapDefinition): { key: string; position: Position } | null {
  const snapped = clampPosition(position, map.width, map.height);
  const key = positionKey(snapped);

  if (map.graph.adjacency[key]) {
    return { position: snapped, key };
  }

  const nearest = nearestWalkable(snapped, map.graph);
  if (!nearest) return null;
  return { position: nearest, key: positionKey(nearest) };
}

export function bfsNextDirection(
  start: Position,
  target: Position,
  map: MapDefinition
): Direction {
  const resolvedStart = resolveToWalkable(start, map);
  const resolvedTarget = resolveToWalkable(target, map);

  if (!resolvedStart || !resolvedTarget) return 'none';
  if (resolvedStart.key === resolvedTarget.key) return 'none';

  return bestNeighborTowardTarget(resolvedStart.key, resolvedTarget.key, map.graph);
}

export function distanceBetweenPositions(
  start: Position,
  target: Position,
  map: MapDefinition
): number | null {
  const resolvedStart = resolveToWalkable(start, map);
  const resolvedTarget = resolveToWalkable(target, map);
  if (!resolvedStart || !resolvedTarget) return null;

  return distanceBetween(resolvedStart.key, resolvedTarget.key, map.graph);
}
