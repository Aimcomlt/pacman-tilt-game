export type Vector2 = { x: number; y: number };

export type TiltInput = {
  raw: Vector2;
  normalized: Vector2;
  timestamp: number;
};

export type ButtonInput = {
  type: 'pause' | 'restart' | 'debug-toggle';
  timestamp: number;
};

export type PlayerState = {
  position: Vector2;
  velocity: Vector2;
  lives: number;
  score: number;
  poweredUpUntil?: number;
};

export type GhostState = PlayerState & {
  mode: 'scatter' | 'chase' | 'frightened' | 'eyes';
  id: string;
};

export type Tile = 0 | 1 | 2 | 3; // blank, wall, pellet, power pellet

export type MapSchema = {
  id: string;
  version: string;
  width: number;
  height: number;
  tiles: Tile[][];
  playerSpawn: Vector2;
  ghostSpawns: Vector2[];
};

export type SpriteAtlas = {
  version: string;
  basePath: string;
  sprites: Record<string, { frame: [number, number, number, number]; anchor?: Vector2 }>;
};

export type Ruleset = {
  tickRate: number;
  pelletScore: number;
  powerPelletScore: number;
  ghostScore: number;
  powerModeDurationMs: number;
};

export type RenderCommand =
  | { type: 'tile'; position: Vector2; tile: Tile }
  | { type: 'sprite'; position: Vector2; spriteId: string }
  | { type: 'overlay'; text: string; position: Vector2 };

export type RenderBatch = {
  camera: Vector2;
  commands: RenderCommand[];
  hud: { score: number; lives: number; level: string };
};

export type EngineSnapshot = {
  player: PlayerState;
  ghosts: GhostState[];
  pelletsRemaining: number;
  timestamp: number;
};

export type EngineEvents = {
  onRender: (batch: RenderBatch) => void;
  onSnapshot?: (snapshot: EngineSnapshot) => void;
  onSound?: (cue: { id: string }) => void;
};
