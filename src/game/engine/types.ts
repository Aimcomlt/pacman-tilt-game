export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export type TileType = 'wall' | 'pellet' | 'power-pellet' | 'empty';

export interface Position {
  x: number;
  y: number;
}

export interface MapDefinition {
  width: number;
  height: number;
  tileSize: number;
  tiles: TileType[][];
  graph: MapGraph;
  pellets: number;
  startPositions: {
    player: Position;
    ghosts: Position[];
  };
}

export interface MapGraph {
  adjacency: Record<string, Position[]>;
  /**
   * Precomputed BFS distances between every pair of walkable nodes.
   * Keys are positionKey strings.
   */
  distances: Record<string, Record<string, number>>;
  /**
   * Cached list of all walkable node positions for quick nearest-node lookups.
   */
  walkableNodes: Position[];
}

export interface SpriteDefinition {
  playerSpeed: number;
  ghostSpeed: number;
  frightenedSpeed: number;
  frightenedTicks: number;
  pelletScore: number;
  powerPelletScore: number;
}

export interface PlayerState {
  position: Position;
  direction: Direction;
  pendingDirection: Direction;
  speed: number;
}

export interface GhostState {
  id: string;
  position: Position;
  direction: Direction;
  mode: 'chase' | 'scatter' | 'frightened';
  frightenedTimer: number;
  speed: number;
}

export interface GameState {
  map: MapDefinition;
  sprites: SpriteDefinition;
  player: PlayerState;
  ghosts: GhostState[];
  pelletsRemaining: number;
  score: number;
  status: 'running' | 'won' | 'lost';
  tick: number;
}

export interface TickInput {
  desiredDirection?: Direction;
}
