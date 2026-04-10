import { MapSchema, Vector2 } from '@pacman/shared';

export type RuntimeExitDirection = 'up' | 'down' | 'left' | 'right';

export type RuntimeTileNode = {
  position: Vector2;
  exits: Partial<Record<RuntimeExitDirection, string>>;
  hazardous: boolean;
};

export type RuntimeZone = {
  id: string;
  tiles: string[];
};

export type RuntimeTileSlice = {
  mapId: string;
  nodes: Record<string, RuntimeTileNode>;
  zones: RuntimeZone[];
};

const keyOf = (position: Vector2): string => `${position.x},${position.y}`;

const parseKey = (key: string): Vector2 => {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
};

const directionVectors: Record<RuntimeExitDirection, Vector2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const isInBounds = (map: MapSchema, x: number, y: number): boolean => x >= 0 && y >= 0 && x < map.width && y < map.height;
const isWalkableTile = (map: MapSchema, x: number, y: number): boolean => map.tiles[y]?.[x] !== 1;

const floodZone = (startKey: string, nodes: Record<string, RuntimeTileNode>, visited: Set<string>): string[] => {
  const queue = [startKey];
  const tiles: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    tiles.push(current);

    const node = nodes[current];
    if (!node) {
      continue;
    }

    Object.values(node.exits).forEach((neighborKey) => {
      if (neighborKey && !visited.has(neighborKey)) {
        queue.push(neighborKey);
      }
    });
  }

  return tiles;
};

export const createRuntimeTileSlice = (
  map: MapSchema,
  options: {
    hazardCells?: Vector2[];
    zoneIdPrefix?: string;
  } = {},
): RuntimeTileSlice => {
  const hazardKeys = new Set((options.hazardCells ?? []).map(keyOf));
  const nodes: Record<string, RuntimeTileNode> = {};

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      if (!isWalkableTile(map, x, y)) {
        continue;
      }

      const position = { x, y };
      const nodeKey = keyOf(position);
      const node: RuntimeTileNode = {
        position,
        exits: {},
        hazardous: hazardKeys.has(nodeKey),
      };

      (Object.entries(directionVectors) as Array<[RuntimeExitDirection, Vector2]>).forEach(([direction, vector]) => {
        const nx = x + vector.x;
        const ny = y + vector.y;
        if (!isInBounds(map, nx, ny) || !isWalkableTile(map, nx, ny)) {
          return;
        }

        const neighborKey = keyOf({ x: nx, y: ny });
        if (hazardKeys.has(nodeKey) || hazardKeys.has(neighborKey)) {
          return;
        }

        node.exits[direction] = neighborKey;
      });

      nodes[nodeKey] = node;
    }
  }

  const visited = new Set<string>();
  const zones: RuntimeZone[] = [];
  const zoneIdPrefix = options.zoneIdPrefix ?? map.id;
  Object.keys(nodes).forEach((nodeKey) => {
    if (visited.has(nodeKey)) {
      return;
    }
    const tiles = floodZone(nodeKey, nodes, visited);
    zones.push({
      id: `${zoneIdPrefix}-zone-${zones.length + 1}`,
      tiles,
    });
  });

  return {
    mapId: map.id,
    nodes,
    zones,
  };
};

export const isTraversalLegal = (slice: RuntimeTileSlice, from: Vector2, to: Vector2): boolean => {
  const fromNode = slice.nodes[keyOf(from)];
  const targetKey = keyOf(to);
  if (!fromNode || fromNode.hazardous) {
    return false;
  }
  return Object.values(fromNode.exits).includes(targetKey);
};

export const findTraversalPath = (slice: RuntimeTileSlice, start: Vector2, target: Vector2): Vector2[] => {
  const startKey = keyOf(start);
  const targetKey = keyOf(target);

  if (!slice.nodes[startKey] || !slice.nodes[targetKey]) {
    return [];
  }

  const queue = [startKey];
  const visited = new Set<string>([startKey]);
  const cameFrom: Record<string, string | undefined> = {
    [startKey]: undefined,
  };

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    if (current === targetKey) {
      break;
    }

    const node = slice.nodes[current];
    Object.values(node.exits).forEach((neighborKey) => {
      if (!neighborKey || visited.has(neighborKey)) {
        return;
      }
      visited.add(neighborKey);
      cameFrom[neighborKey] = current;
      queue.push(neighborKey);
    });
  }

  if (!visited.has(targetKey)) {
    return [];
  }

  const pathKeys: string[] = [];
  let cursor: string | undefined = targetKey;
  while (cursor) {
    pathKeys.push(cursor);
    cursor = cameFrom[cursor];
  }

  return pathKeys.reverse().map(parseKey);
};
