import { createGameState, loadMap, loadRules, tickGame } from '..';
import { CollisionSystem } from '../systems/CollisionSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { Ruleset } from '@pacman/shared';

const rules: Ruleset = loadRules({
  tickRate: 60,
  pelletScore: 10,
  powerPelletScore: 50,
  ghostScore: 200,
  powerModeDurationMs: 6000,
});

const buildMap = (tiles: number[][]) =>
  loadMap({
    id: 'test-map',
    version: '1.0.0',
    width: tiles[0].length,
    height: tiles.length,
    tiles,
    playerSpawn: { x: 0, y: 0 },
    ghostSpawns: [{ x: tiles[0].length - 1, y: 0 }],
  });

describe('MovementSystem', () => {
  it('prevents movement through walls and map edges when resolving per tile', () => {
    const map = buildMap([[0, 1, 0]]);
    const state = createGameState(map);
    const tilt = { raw: { x: 1, y: 0 }, normalized: { x: 1, y: 0 }, timestamp: Date.now() } as const;

    state.inputs.tilt = tilt;
    MovementSystem.integrate(state, map, rules, 2000);
    expect(Math.round(state.player.position.x)).toBe(0);

    state.inputs.tilt = { ...tilt, normalized: { x: -1, y: 0 }, raw: { x: -1, y: 0 } };
    MovementSystem.integrate(state, map, rules, 2000);
    expect(state.player.position.x).toBeGreaterThanOrEqual(0);
  });
});

describe('CollisionSystem', () => {
  it('consumes pellets without mutating the map asset', () => {
    const map = buildMap([[2]]);
    const state = createGameState(map);

    tickGame({ state, map, rules, delta: 0 });

    expect(state.pelletsRemaining).toBe(0);
    expect(state.player.score).toBe(rules.pelletScore);
    expect(map.tiles[0][0]).toBe(2);
  });

  it('handles ghost collisions based on power mode', () => {
    const map = buildMap([[0, 0, 0]]);
    const state = createGameState(map);

    state.ghosts[0].position = { ...state.player.position };
    CollisionSystem.resolve(state, map, rules);
    expect(state.player.lives).toBe(2);
    expect(state.ghosts[0].mode).toBe('scatter');

    state.player.poweredUpUntil = Date.now() + 1000;
    state.ghosts[0].position = { ...state.player.position };
    state.player.score = 0;

    CollisionSystem.resolve(state, map, rules);
    expect(state.ghosts[0].mode).toBe('eyes');
    expect(state.ghosts[0].position).toEqual(map.ghostSpawns[0]);
    expect(state.player.score).toBe(rules.ghostScore);
  });
});
