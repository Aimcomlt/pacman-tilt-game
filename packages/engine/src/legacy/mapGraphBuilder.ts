import { Direction, MapGraph, Position, TileType } from './types';

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

function normalizePosition(position: Position): Position {
  return { x: Math.round(position.x), y: Math.round(position.y) };
}

function buildAdjacency(tiles: TileType[][]): Record<string, Position[]> {
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

  return adjacency;
}

function bfsDistancesFrom(
  startKey: string,
  adjacency: Record<string, Position[]>
): Record<string, number> {
  const distances: Record<string, number> = { [startKey]: 0 };
  const queue: string[] = [startKey];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const baseDistance = distances[current];

    adjacency[current]?.forEach((neighbor) => {
      const neighborKey = positionKey(neighbor);
      if (distances[neighborKey] === undefined) {
        distances[neighborKey] = baseDistance + 1;
        queue.push(neighborKey);
      }
    });
  }

  return distances;
}

function precomputeDistances(adjacency: Record<string, Position[]>): Record<string, Record<string, number>> {
  const distances: Record<string, Record<string, number>> = {};
  Object.keys(adjacency).forEach((startKey) => {
    distances[startKey] = bfsDistancesFrom(startKey, adjacency);
  });
  return distances;
}

export function buildMapGraph(tiles: TileType[][]): MapGraph {
  const adjacency = buildAdjacency(tiles);
  const walkableNodes = Object.keys(adjacency).map((key) => {
    const [x, y] = key.split(',').map(Number);
    return { x, y } as Position;
  });
  const distances = precomputeDistances(adjacency);
  return { adjacency, distances, walkableNodes };
}

export function nearestWalkable(target: Position, graph: MapGraph): Position | null {
  if (graph.walkableNodes.length === 0) return null;
  const snapped = normalizePosition(target);
  let best = graph.walkableNodes[0];
  let bestDistance = Number.MAX_SAFE_INTEGER;

  graph.walkableNodes.forEach((node) => {
    const distance = Math.abs(snapped.x - node.x) + Math.abs(snapped.y - node.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = node;
    }
  });

  return best;
}

function directionFromDelta(delta: Position): Direction {
  if (delta.x === 1) return 'right';
  if (delta.x === -1) return 'left';
  if (delta.y === 1) return 'down';
  if (delta.y === -1) return 'up';
  return 'none';
}

export function bestNeighborTowardTarget(
  startKey: string,
  targetKey: string,
  graph: MapGraph
): Direction {
  const neighbors = graph.adjacency[startKey] ?? [];
  if (neighbors.length === 0) return 'none';

  const [sx, sy] = startKey.split(',').map(Number);
  let bestDirection: Direction = 'none';
  let bestDistance = Number.MAX_SAFE_INTEGER;

  neighbors.forEach((neighbor) => {
    const neighborKey = positionKey(neighbor);
    const distance = graph.distances[neighborKey]?.[targetKey];
    if (distance !== undefined && distance < bestDistance) {
      bestDistance = distance;
      bestDirection = directionFromDelta({ x: neighbor.x - sx, y: neighbor.y - sy });
    }
  });

  return bestDirection;
}

export function distanceBetween(startKey: string, targetKey: string, graph: MapGraph): number | null {
  const distance = graph.distances[startKey]?.[targetKey];
  return distance === undefined ? null : distance;
}
