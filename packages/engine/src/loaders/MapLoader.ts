import { MapSchema, Tile, Vector2 } from '@pacman/shared';

const isTile = (value: unknown): value is Tile => typeof value === 'number' && value >= 0 && value <= 3;

const coerceVector = (value: unknown): Vector2 | null => {
  if (!value || typeof value !== 'object') return null;
  const { x, y } = value as { x?: unknown; y?: unknown };
  if (typeof x !== 'number' || typeof y !== 'number') return null;
  return { x, y };
};

const normalizeTiles = (rawTiles: unknown, width?: number, height?: number): { tiles: Tile[][]; width: number; height: number } => {
  if (!Array.isArray(rawTiles) || rawTiles.length === 0) {
    throw new Error('Map tiles must be a non-empty 2D array');
  }

  const targetHeight = height ?? rawTiles.length;
  const targetWidth = width ?? Math.max(...rawTiles.map((row) => (Array.isArray(row) ? row.length : 0)));

  if (!Number.isInteger(targetHeight) || targetHeight <= 0 || !Number.isInteger(targetWidth) || targetWidth <= 0) {
    throw new Error('Map width and height must be positive integers');
  }

  const tiles: Tile[][] = [];
  for (let y = 0; y < targetHeight; y += 1) {
    const sourceRow = Array.isArray(rawTiles[y]) ? rawTiles[y] : [];
    const row: Tile[] = [];
    for (let x = 0; x < targetWidth; x += 1) {
      const value = sourceRow[x];
      row.push(isTile(value) ? value : 0);
    }
    tiles.push(row);
  }

  return { tiles, width: targetWidth, height: targetHeight };
};

const defaultPlayerSpawn = (width: number, height: number): Vector2 => ({
  x: Math.floor(width / 2),
  y: Math.floor(height / 2),
});

const defaultGhostSpawns = (player: Vector2): Vector2[] => [
  { x: Math.max(0, player.x - 1), y: player.y },
  { x: player.x, y: Math.max(0, player.y - 1) },
];

export const MapLoader = {
  parse(raw: unknown): MapSchema {
    const data = raw as Partial<MapSchema>;
    if (!data || typeof data.id !== 'string' || typeof data.version !== 'string') {
      throw new Error('Invalid map metadata');
    }

    const { tiles, width, height } = normalizeTiles(data.tiles, data.width, data.height);
    const playerSpawn = coerceVector(data.playerSpawn) ?? defaultPlayerSpawn(width, height);
    const ghostSpawns = Array.isArray(data.ghostSpawns)
      ? (data.ghostSpawns.map(coerceVector).filter(Boolean) as Vector2[])
      : [];

    return {
      id: data.id,
      version: data.version,
      width,
      height,
      tiles,
      playerSpawn,
      ghostSpawns: ghostSpawns.length > 0 ? ghostSpawns : defaultGhostSpawns(playerSpawn),
    };
  },
};
