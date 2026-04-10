import { createGameState, createRuntimeTileSlice, findTraversalPath, isTraversalLegal, loadMap, loadRules } from '..';
import { CollisionSystem } from '../systems/CollisionSystem';

const rules = loadRules({
  tickRate: 60,
  pelletScore: 10,
  powerPelletScore: 50,
  ghostScore: 200,
  powerModeDurationMs: 5000,
});

describe('Phase 5 runtime tile traversal integration', () => {
  test('loaded map artifact can drive a legal playable traversal flow end-to-end', () => {
    const map = loadMap({
      id: 'phase5-runtime-map',
      version: '1.0.0',
      width: 7,
      height: 5,
      tiles: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 2, 0, 1],
        [1, 0, 1, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1],
      ],
      playerSpawn: { x: 1, y: 1 },
      ghostSpawns: [{ x: 5, y: 3 }],
    });

    const runtime = createRuntimeTileSlice(map, {
      hazardCells: [{ x: 3, y: 1 }],
      zoneIdPrefix: 'phase5',
    });

    const path = findTraversalPath(runtime, map.playerSpawn, { x: 4, y: 1 });
    expect(path.length).toBeGreaterThan(2);
    expect(path.some((tile) => tile.x === 3 && tile.y === 1)).toBe(false);

    const state = createGameState(map);
    expect(state.pelletsRemaining).toBe(1);

    for (let i = 1; i < path.length; i += 1) {
      const from = path[i - 1];
      const to = path[i];
      expect(isTraversalLegal(runtime, from, to)).toBe(true);

      state.player.position = { ...to };
      state.player.velocity = { x: 0, y: 0 };
      CollisionSystem.resolve(state, map, rules);
    }

    expect(state.player.position).toEqual({ x: 4, y: 1 });
    expect(state.pelletsRemaining).toBe(0);
    expect(state.player.score).toBe(rules.pelletScore);
    expect(runtime.zones).toHaveLength(2);
  });

  test('hazard geometry invalidates exits and blocks traversal when lane is fully severed', () => {
    const map = loadMap({
      id: 'phase5-severed-map',
      version: '1.0.0',
      width: 5,
      height: 3,
      tiles: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
      ],
      playerSpawn: { x: 1, y: 1 },
      ghostSpawns: [{ x: 3, y: 1 }],
    });

    const runtime = createRuntimeTileSlice(map, {
      hazardCells: [{ x: 2, y: 1 }],
    });

    const path = findTraversalPath(runtime, { x: 1, y: 1 }, { x: 3, y: 1 });
    expect(path).toEqual([]);
    expect(isTraversalLegal(runtime, { x: 1, y: 1 }, { x: 2, y: 1 })).toBe(false);
  });
});
