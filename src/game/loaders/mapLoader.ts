import { MapDefinition, Position, TileType } from '../engine/types';
import { buildGraph } from '../engine/pathfinding';

export interface MapJSON {
  layout?: string[];
  legend?: Partial<Record<string, TileType | 'player' | 'ghost'>>;
  tileSize?: number;
}

const DEFAULT_LAYOUT: string[] = [
  '##########',
  '#........#',
  '#.####...#',
  '#.#P..G..#',
  '#........#',
  '##########',
];

const DEFAULT_LEGEND: Record<string, TileType | 'player' | 'ghost'> = {
  '#': 'wall',
  '.': 'pellet',
  'P': 'player',
  'G': 'ghost',
  ' ': 'empty',
};

function applyLegend(char: string, legend: Record<string, TileType | 'player' | 'ghost'>): TileType {
  const entry = legend[char];
  if (entry === 'player' || entry === 'ghost') {
    return 'pellet';
  }
  if (!entry) {
    return 'empty';
  }
  return entry;
}

function clampPosition(position: Position, width: number, height: number): Position {
  return {
    x: Math.max(0, Math.min(position.x, width - 1)),
    y: Math.max(0, Math.min(position.y, height - 1)),
  };
}

export function loadMap(mapData: MapJSON = {}): MapDefinition {
  const layout = mapData.layout && mapData.layout.length > 0 ? mapData.layout : DEFAULT_LAYOUT;
  const legend = { ...DEFAULT_LEGEND, ...(mapData.legend || {}) };
  const height = layout.length;
  const width = layout[0]?.length || 0;

  let playerStart: Position | null = null;
  const ghostStarts: Position[] = [];

  const tiles: TileType[][] = layout.map((row, y) =>
    row.split('').map((cell, x) => {
      const symbol = legend[cell] ?? 'empty';
      if (symbol === 'player') {
        playerStart = { x, y };
        return 'pellet';
      }
      if (symbol === 'ghost') {
        ghostStarts.push({ x, y });
        return 'pellet';
      }
      return applyLegend(cell, legend);
    })
  );

  const safePlayerStart = clampPosition(
    playerStart ?? { x: Math.floor(width / 2), y: Math.floor(height / 2) },
    width,
    height
  );

  const pellets = tiles.flat().filter((tile) => tile === 'pellet' || tile === 'power-pellet').length;

  const graph = buildGraph(tiles);

  return {
    width,
    height,
    tileSize: mapData.tileSize ?? 24,
    tiles,
    graph,
    pellets,
    startPositions: {
      player: safePlayerStart,
      ghosts: ghostStarts.length > 0 ? ghostStarts : [{ x: safePlayerStart.x - 1, y: safePlayerStart.y }],
    },
  };
}
