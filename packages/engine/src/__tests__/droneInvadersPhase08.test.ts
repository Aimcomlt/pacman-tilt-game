import { DroneWorldSignal } from '@pacman/shared';
import { tickDroneInvaders } from '..';

const createWorld = (overrides: Partial<DroneWorldSignal> = {}): DroneWorldSignal => ({
  sector: {
    id: 'sector-phase8',
    width: 12,
    height: 12,
    blockedCells: [],
    ...overrides.sector,
  },
  entities: [
    {
      id: 'ship-1',
      kind: 'player-ship',
      faction: 'player',
      position: { x: 4, y: 10 },
      velocity: { x: 0, y: 0 },
      integrity: 100,
      active: true,
    },
  ],
  resources: [
    {
      id: 'resource-a',
      position: { x: 2, y: 2 },
      richness: 0.8,
      contested: false,
    },
  ],
  run: {
    timestampMs: 10000,
    resourcesBanked: 70,
    currentSectorId: 'sector-phase8',
    threatLevel: 0.25,
    activeObjectives: ['extract-resource-a'],
    ...overrides.run,
  },
  conway: {
    step: 14,
    aliveCells: [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 6, y: 5 },
    ],
    ...overrides.conway,
  },
  ...overrides,
});

describe('Drone-Invaders Phase 8 sector progression and unlock economy', () => {
  test('tick output includes progression unlock options and spend guidance', () => {
    const output = tickDroneInvaders({ deltaMs: 16, world: createWorld() });

    expect(output.phase8Progression.unlockOptions).toHaveLength(3);
    expect(output.phase8Progression.spendPriority).toBe('unlock');
    expect(output.phase8Progression.unlockOptions.every((option) => option.unlocked)).toBe(true);
    expect(output.phase8Progression.summary.length).toBeGreaterThan(0);
  });

  test('progression guidance biases toward stabilization when safe path collapses', () => {
    const output = tickDroneInvaders({
      deltaMs: 16,
      world: createWorld({
        sector: {
          id: 'sector-phase8-blocked',
          width: 12,
          height: 12,
          blockedCells: Array.from({ length: 12 }, (_, y) => ({ x: 5, y })),
        },
        run: {
          timestampMs: 10001,
          resourcesBanked: 32,
          currentSectorId: 'sector-phase8-blocked',
          threatLevel: 0.95,
          activeObjectives: ['survive'],
        },
      }),
    });

    expect(output.phase8Progression.spendPriority).toBe('stabilize');
    expect(output.phase8Progression.recoveryBufferTarget).toBeGreaterThanOrEqual(35);
    expect(output.phase8Progression.unlockOptions.find((option) => option.id === 'defense-grid')?.recommended).toBe(true);
  });
});
