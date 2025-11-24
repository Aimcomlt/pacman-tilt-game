import {
  bfsNextDirection,
  buildMapGraph,
  chooseDirection,
  createInitialState,
  detectCollisions,
  distanceBetweenPositions,
  loadLegacyMap,
  loadLegacySprites,
  moveGhost,
  movePlayer,
  positionKey,
  tick,
  type LegacyGameState as EngineGameState,
  type LegacyGhostState as GhostState,
  type LegacyPlayerState as PlayerState,
  type Position,
} from '@pacman/engine';
import { Direction } from '@pacman/shared';

const basicMap = loadLegacyMap({
  layout: [
    '###',
    '#P ',
    '###',
  ],
  legend: { '#': 'wall', 'P': 'player', ' ': 'empty' },
});

function createPlayer(position: Position, direction: Direction = 'none'): PlayerState {
  return {
    position,
    direction,
    pendingDirection: 'none',
    speed: 1,
  };
}

function createGhost(position: Position, id = 'blinky', mode: GhostState['mode'] = 'chase'): GhostState {
  return {
    id,
    position,
    direction: 'left',
    mode,
    frightenedTimer: 0,
    speed: 1,
  };
}

describe('movement system', () => {
  it('honors walls and updates pending direction', () => {
    const player = createPlayer({ x: 1, y: 1 });

    const blocked = movePlayer(player, basicMap, 'left');
    expect(blocked.position).toEqual(player.position);
    expect(blocked.pendingDirection).toBe('left');

    const moved = movePlayer(player, basicMap, 'right');
    expect(moved.position.x).toBeCloseTo(2);
    expect(moved.direction).toBe('right');
  });

  it('moves ghosts using chosen direction', () => {
    const ghost = createGhost({ x: 1, y: 1 });
    const player = createPlayer({ x: 2, y: 1 });

    const moved = moveGhost(ghost, player, basicMap, [ghost]);
    expect(moved.position.x).toBeGreaterThan(ghost.position.x);
  });
});

describe('collision detection', () => {
  it('detects overlap between player and ghost tiles', () => {
    const state: EngineGameState = {
      map: basicMap,
      sprites: loadLegacySprites(),
      player: createPlayer({ x: 1, y: 1 }),
      ghosts: [createGhost({ x: 1, y: 1 })],
      pelletsRemaining: 1,
      score: 0,
      status: 'running',
      tick: 0,
    };

    expect(detectCollisions(state)).toBe('lost');
  });
});

describe('pellet consumption', () => {
  it('awards points and frightens ghosts on power pellet', () => {
    const initial = createInitialState({ layout: ['PO'], legend: { '#': 'wall', '.': 'pellet', 'P': 'player', 'O': 'power-pellet' } }, { pelletScore: 5, powerPelletScore: 25, frightenedTicks: 3 });

    const advanced = tick(initial, { desiredDirection: 'right' });

    expect(advanced.score).toBe(25);
    expect(advanced.pelletsRemaining).toBe(initial.pelletsRemaining - 1);
    expect(advanced.ghosts.every((ghost) => ghost.mode === 'frightened')).toBe(true);
  });
});

describe('ghost AI', () => {
  it('pursues the player when in chase mode', () => {
    const map = loadLegacyMap({ layout: ['G.P'], legend: { '#': 'wall', '.': 'pellet', 'G': 'ghost', 'P': 'player' } });
    const ghost = createGhost({ x: 0, y: 0 }, 'blinky', 'chase');
    const player = createPlayer({ x: 2, y: 0 });

    const direction = chooseDirection(ghost, player, map, [ghost]);
    expect(direction).toBe('right');
  });
});

describe('graph pathfinding', () => {
  it('returns next direction toward target when a path exists', () => {
    const map = loadLegacyMap({
      layout: [
        '....',
        '.##.',
        '....',
      ],
      legend: { '#': 'wall', '.': 'pellet' },
    });

    const start = { x: 0, y: 0 };
    const target = { x: 3, y: 0 };

    expect(bfsNextDirection(start, target, map)).toBe('right');
    expect(distanceBetweenPositions(start, target, map)).toBe(3);
  });

  it('computes neighbor distances on a dense graph', () => {
    const graph = buildMapGraph([
      ['pellet', 'pellet'],
      ['pellet', 'pellet'],
    ]);

    const startKey = positionKey({ x: 0, y: 0 });
    const targetKey = positionKey({ x: 1, y: 1 });

    const distance = graph.distances[startKey][targetKey];
    expect(distance).toBe(2);
  });
});
