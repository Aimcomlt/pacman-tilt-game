import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Direction, GhostState, MapSchema, PlayerState, RenderBatch, Tile, Vector2 } from '@pacman/shared';
import mapJson from '../../../../assets/maps/default.json';
import { RootState } from '..';

type Pellet = { position: Vector2; type: 'pellet' | 'power' };

export type TickState = {
  count: number;
  lastDeltaMs: number;
};

export type GameGhostState = GhostState & { aiEnabled: boolean };

export type GameState = {
  status: 'idle' | 'running' | 'paused' | 'gameOver';
  levelId: string;
  map: MapSchema;
  pacman: PlayerState & { direction: Direction };
  ghosts: GameGhostState[];
  pellets: Pellet[];
  powerTimerMs: number;
  score: number;
  tick: TickState;
};

const pelletScore = 10;
const powerPelletScore = 50;
const ghostScore = 200;
const powerDurationMs = 6000;

const asMapSchema = mapJson as MapSchema;

const directionVectors: Record<Direction, Vector2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  none: { x: 0, y: 0 },
};

const extractPellets = (map: MapSchema): Pellet[] => {
  const pellets: Pellet[] = [];
  map.tiles.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile === 2) pellets.push({ position: { x, y }, type: 'pellet' });
      if (tile === 3) pellets.push({ position: { x, y }, type: 'power' });
    });
  });
  return pellets;
};

const createGhosts = (map: MapSchema): GameGhostState[] =>
  map.ghostSpawns.map((spawn, index) => ({
    id: `ghost-${index + 1}`,
    position: { ...spawn },
    velocity: { x: 0, y: 0 },
    lives: 0,
    score: 0,
    poweredUpUntil: undefined,
    mode: 'scatter',
    aiEnabled: true,
  }));

const createInitialState = (map: MapSchema = asMapSchema): GameState => ({
  status: 'idle',
  levelId: map.id,
  map,
  pacman: {
    position: { ...map.playerSpawn },
    velocity: { x: 0, y: 0 },
    direction: 'none',
    lives: 3,
    score: 0,
  },
  ghosts: createGhosts(map),
  pellets: extractPellets(map),
  powerTimerMs: 0,
  score: 0,
  tick: { count: 0, lastDeltaMs: 0 },
});

const isWalkable = (map: MapSchema, position: Vector2) => {
  const { x, y } = position;
  if (y < 0 || y >= map.tiles.length || x < 0 || x >= map.tiles[0].length) return false;
  return map.tiles[y][x] !== 1;
};

const attemptMove = (map: MapSchema, start: Vector2, direction: Direction): Vector2 => {
  const delta = directionVectors[direction];
  const target = { x: start.x + delta.x, y: start.y + delta.y };
  if (!direction || direction === 'none') return start;
  return isWalkable(map, target) ? target : start;
};

const gameSlice = createSlice({
  name: 'game',
  initialState: createInitialState(),
  reducers: {
    startGame: (state) => {
      state.status = 'running';
    },
    pauseGame: (state) => {
      state.status = 'paused';
    },
    resetGame: (state) => {
      Object.assign(state, createInitialState(state.map));
    },
    loadLevel: (state, action: PayloadAction<MapSchema>) => {
      Object.assign(state, createInitialState(action.payload));
      state.status = 'running';
    },
    movePacman: (state, action: PayloadAction<Direction>) => {
      if (state.status !== 'running') return;
      state.pacman.direction = action.payload;
      state.pacman.position = attemptMove(state.map, state.pacman.position, action.payload);
    },
    moveGhost: (state, action: PayloadAction<{ id: string; direction: Direction }>) => {
      if (state.status !== 'running') return;
      const ghost = state.ghosts.find((g) => g.id === action.payload.id);
      if (!ghost || !ghost.aiEnabled) return;
      ghost.mode = ghost.mode === 'eyes' ? 'eyes' : ghost.mode;
      ghost.position = attemptMove(state.map, ghost.position, action.payload.direction);
    },
    setGhostMode: (state, action: PayloadAction<{ id: string; mode: GhostState['mode'] }>) => {
      const ghost = state.ghosts.find((g) => g.id === action.payload.id);
      if (ghost) ghost.mode = action.payload.mode;
    },
    setGhostAiEnabled: (state, action: PayloadAction<{ id: string; enabled: boolean }>) => {
      const ghost = state.ghosts.find((g) => g.id === action.payload.id);
      if (ghost) ghost.aiEnabled = action.payload.enabled;
    },
    advanceTick: (state, action: PayloadAction<{ deltaMs: number }>) => {
      if (state.status !== 'running') return;
      state.tick.count += 1;
      state.tick.lastDeltaMs = action.payload.deltaMs;

      if (state.powerTimerMs > 0) {
        state.powerTimerMs = Math.max(0, state.powerTimerMs - action.payload.deltaMs);
        if (state.powerTimerMs === 0) {
          state.pacman.poweredUpUntil = undefined;
          state.ghosts.forEach((ghost) => {
            if (ghost.mode === 'frightened') ghost.mode = 'scatter';
          });
        }
      }
    },
    resolveCollisions: (state) => {
      if (state.status !== 'running') return;
      const pelletIndex = state.pellets.findIndex(
        (pellet) => pellet.position.x === state.pacman.position.x && pellet.position.y === state.pacman.position.y,
      );
      if (pelletIndex >= 0) {
        const pellet = state.pellets[pelletIndex];
        state.pellets.splice(pelletIndex, 1);
        state.score += pellet.type === 'power' ? powerPelletScore : pelletScore;
        state.pacman.score = state.score;
        if (pellet.type === 'power') {
          state.powerTimerMs = powerDurationMs;
          state.pacman.poweredUpUntil = Date.now() + powerDurationMs;
          state.ghosts.forEach((ghost) => {
            if (ghost.mode !== 'eyes') ghost.mode = 'frightened';
          });
        }
      }

      state.ghosts.forEach((ghost) => {
        const overlapping = ghost.position.x === state.pacman.position.x && ghost.position.y === state.pacman.position.y;
        if (!overlapping) return;

        if (state.powerTimerMs > 0 && ghost.mode !== 'eyes') {
          ghost.mode = 'eyes';
          ghost.position = { ...state.map.ghostSpawns[0] };
          state.score += ghostScore;
          state.pacman.score = state.score;
        } else if (ghost.mode !== 'eyes') {
          state.pacman.lives -= 1;
          if (state.pacman.lives <= 0) state.status = 'gameOver';
          state.pacman.position = { ...state.map.playerSpawn };
        }
      });

      if (state.pellets.length === 0 && state.status === 'running') {
        state.status = 'paused';
      }
    },
  },
});

export const {
  startGame,
  pauseGame,
  resetGame,
  loadLevel,
  movePacman,
  moveGhost,
  setGhostMode,
  setGhostAiEnabled,
  advanceTick,
  resolveCollisions,
} = gameSlice.actions;

export const selectRenderBatch = (state: RootState): RenderBatch => {
  const { game } = state;
  const commands: RenderBatch['commands'] = [];

  game.map.tiles.forEach((row, y) => {
    row.forEach((tile, x) => {
      const isWall = tile === 1;
      if (isWall) {
        commands.push({ type: 'tile', position: { x, y }, tile: 1 as Tile });
      }
    });
  });

  game.pellets.forEach((pellet) => {
    commands.push({
      type: 'tile',
      position: { ...pellet.position },
      tile: pellet.type === 'power' ? (3 as Tile) : (2 as Tile),
    });
  });

  commands.push({ type: 'sprite', position: { ...game.pacman.position }, spriteId: 'pacman' });
  game.ghosts.forEach((ghost) => {
    commands.push({ type: 'sprite', position: { ...ghost.position }, spriteId: ghost.id });
  });

  return {
    camera: { x: 0, y: 0 },
    commands,
    hud: { score: game.score, lives: game.pacman.lives, level: game.levelId },
  };
};

export default gameSlice.reducer;
