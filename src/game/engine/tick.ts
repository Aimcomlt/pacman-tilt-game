import { detectCollisions } from './collisions';
import { moveGhost, movePlayer } from './movement';
import { loadMap, MapJSON } from '../loaders/mapLoader';
import { loadSprites, SpriteJSON } from '../loaders/spriteLoader';
import { GameState, GhostState, TickInput } from './types';

function cloneTiles(tiles: GameState['map']['tiles']): GameState['map']['tiles'] {
  return tiles.map((row) => [...row]);
}

function applyFrightened(ghosts: GhostState[], ticks: number): GhostState[] {
  return ghosts.map((ghost) => ({
    ...ghost,
    mode: 'frightened',
    frightenedTimer: ticks,
    speed: Math.max(ghost.speed * 0.8, 0.2),
  }));
}

function tickGhostTimers(ghosts: GhostState[]): GhostState[] {
  return ghosts.map((ghost) => {
    if (ghost.mode !== 'frightened') return ghost;
    const remaining = Math.max(ghost.frightenedTimer - 1, 0);
    return {
      ...ghost,
      frightenedTimer: remaining,
      mode: remaining === 0 ? 'chase' : 'frightened',
    };
  });
}

function consumePellet(state: GameState): GameState {
  const x = Math.round(state.player.position.x);
  const y = Math.round(state.player.position.y);

  const tiles = cloneTiles(state.map.tiles);
  const tile = tiles[y][x];

  if (tile === 'pellet' || tile === 'power-pellet') {
    tiles[y][x] = 'empty';
    const pelletsRemaining = Math.max(state.pelletsRemaining - 1, 0);
    const score =
      state.score + (tile === 'power-pellet' ? state.sprites.powerPelletScore : state.sprites.pelletScore);

    const ghosts = tile === 'power-pellet'
      ? applyFrightened(state.ghosts, state.sprites.frightenedTicks)
      : state.ghosts;

    return {
      ...state,
      map: { ...state.map, tiles },
      pelletsRemaining,
      ghosts,
      score,
    };
  }

  return state;
}

export function createInitialState(mapData: MapJSON, spriteData: SpriteJSON): GameState {
  const map = loadMap(mapData);
  const sprites = loadSprites(spriteData);

  const player = {
    position: { ...map.startPositions.player },
    direction: 'none' as const,
    pendingDirection: 'none' as const,
    speed: sprites.playerSpeed,
  };

  const personalities = ['blinky', 'pinky', 'inky', 'clyde'];
  const ghosts: GhostState[] = map.startPositions.ghosts.map((position, index) => ({
    id: personalities[index % personalities.length],
    position: { ...position },
    direction: 'left',
    mode: 'chase',
    frightenedTimer: 0,
    speed: sprites.ghostSpeed,
  }));

  return {
    map,
    sprites,
    player,
    ghosts,
    pelletsRemaining: map.pellets,
    status: 'running',
    score: 0,
    tick: 0,
  };
}

export function tick(state: GameState, input: TickInput = {}): GameState {
  if (state.status !== 'running') return state;

  const nextPlayer = movePlayer(state.player, state.map, input.desiredDirection ?? state.player.pendingDirection);

  const frightenedGhosts = tickGhostTimers(state.ghosts);
  const ghosts = frightenedGhosts.map((ghost) =>
    moveGhost(ghost, nextPlayer, state.map, frightenedGhosts)
  );

  let nextState: GameState = {
    ...state,
    player: nextPlayer,
    ghosts,
    tick: state.tick + 1,
  };

  nextState = consumePellet(nextState);

  const collisionStatus = detectCollisions(nextState);
  if (collisionStatus === 'lost') {
    return { ...nextState, status: 'lost' };
  }

  if (nextState.pelletsRemaining === 0) {
    return { ...nextState, status: 'won' };
  }

  return nextState;
}
