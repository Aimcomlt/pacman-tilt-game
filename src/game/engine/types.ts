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
  pellets: number;
  startPositions: {
    player: Position;
    ghosts: Position[];
  };
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
