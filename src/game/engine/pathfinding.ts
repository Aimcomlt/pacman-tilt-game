import { Direction, MapDefinition, MapGraph, Position } from './types';

const directionVectors: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  none: { x: 0, y: 0 },
};

export function positionKey(position: Position): string {
  return `${position.x},${position.y}`;
}

function clampPosition(position: Position, width: number, height: number): Position {
  return {
    x: Math.max(0, Math.min(Math.round(position.x), width - 1)),
    y: Math.max(0, Math.min(Math.round(position.y), height - 1)),
  };
}

export function buildGraph(tiles: MapDefinition['tiles']): MapGraph {
  const height = tiles.length;
  const width = tiles[0]?.length ?? 0;
  const adjacency: Record<string, Position[]> = {};

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (tiles[y][x] === 'wall') continue;
      const neighbors: Position[] = [];
      (['up', 'down', 'left', 'right'] as Direction[]).forEach((direction) => {
        const vector = directionVectors[direction];
        const nx = x + vector.x;
        const ny = y + vector.y;
        if (nx >= 0 && ny >= 0 && ny < height && nx < width && tiles[ny][nx] !== 'wall') {
          neighbors.push({ x: nx, y: ny });
        }
      });
      adjacency[positionKey({ x, y })] = neighbors;
    }
  }

  return { adjacency };
}

function nearestWalkable(target: Position, graph: MapGraph): Position | null {
  const entries = Object.keys(graph.adjacency);
  if (entries.length === 0) return null;
  const clamped = { x: Math.round(target.x), y: Math.round(target.y) };
  let bestKey = entries[0];
  let bestDistance = Number.MAX_SAFE_INTEGER;

  entries.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    const distance = Math.abs(clamped.x - x) + Math.abs(clamped.y - y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestKey = key;
    }
  });

  const [x, y] = bestKey.split(',').map(Number);
  return { x, y };
}

function reconstructDirection(
  start: Position,
  targetKey: string,
  parents: Record<string, string | null>
): Direction {
  let currentKey: string | null = targetKey;
  let previousKey: string | null = null;

  while (currentKey) {
    const parent = parents[currentKey];
    if (parent === null || parent === undefined) break;
    previousKey = currentKey;
    currentKey = parent;
    if (currentKey === positionKey(start)) {
      break;
    }
  }

  if (!previousKey) return 'none';
  const [px, py] = previousKey.split(',').map(Number);
  const dx = px - Math.round(start.x);
  const dy = py - Math.round(start.y);

  if (dx === 1) return 'right';
  if (dx === -1) return 'left';
  if (dy === 1) return 'down';
  if (dy === -1) return 'up';
  return 'none';
}

export function bfsNextDirection(
  start: Position,
  target: Position,
  map: MapDefinition
): Direction {
  const graph = map.graph;
  const snappedStart = clampPosition(start, map.width, map.height);
  const snappedTarget = clampPosition(target, map.width, map.height);

  const startKey = positionKey(snappedStart);
  const hasStart = Boolean(graph.adjacency[startKey]);
  const targetKey = positionKey(snappedTarget);
  const hasTarget = Boolean(graph.adjacency[targetKey]);

  if (!hasStart) {
    const nearest = nearestWalkable(snappedStart, graph);
    if (!nearest) return 'none';
    snappedStart.x = nearest.x;
    snappedStart.y = nearest.y;
  }

  let resolvedTarget = snappedTarget;
  if (!hasTarget) {
    const nearest = nearestWalkable(snappedTarget, graph);
    if (!nearest) return 'none';
    resolvedTarget = nearest;
  }

  const resolvedTargetKey = positionKey(resolvedTarget);
  const queue: string[] = [positionKey(snappedStart)];
  const visited = new Set<string>(queue);
  const parents: Record<string, string | null> = { [queue[0]]: null };

  while (queue.length > 0) {
    const currentKey = queue.shift()!;
    if (currentKey === resolvedTargetKey) {
      return reconstructDirection(snappedStart, resolvedTargetKey, parents);
    }

    const neighbors = graph.adjacency[currentKey] ?? [];
    neighbors.forEach((neighbor) => {
      const neighborKey = positionKey(neighbor);
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        parents[neighborKey] = currentKey;
        queue.push(neighborKey);
      }
    });
  }

  return 'none';
}
