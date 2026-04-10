import { DroneWorldSignal } from '@pacman/shared';
import { createAssistantUiScaffold, tickDroneInvaders } from '..';

const createWorld = (overrides: Partial<DroneWorldSignal> = {}): DroneWorldSignal => ({
  sector: {
    id: 'sector-phase3',
    width: 10,
    height: 10,
    blockedCells: [],
    ...overrides.sector,
  },
  entities: [
    {
      id: 'ship-1',
      kind: 'player-ship',
      faction: 'player',
      position: { x: 5, y: 9 },
      velocity: { x: 0, y: 0 },
      integrity: 100,
      active: true,
    },
  ],
  resources: [
    {
      id: 'resource-1',
      position: { x: 3, y: 2 },
      richness: 0.85,
      contested: false,
    },
    {
      id: 'resource-2',
      position: { x: 8, y: 3 },
      richness: 0.65,
      contested: true,
    },
  ],
  run: {
    timestampMs: 2000,
    resourcesBanked: 10,
    currentSectorId: 'sector-phase3',
    threatLevel: 0.9,
    activeObjectives: ['extract-resource-1'],
    ...overrides.run,
  },
  conway: {
    step: 4,
    aliveCells: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 2 },
      { x: 7, y: 7 },
      { x: 7, y: 8 },
    ],
    ...overrides.conway,
  },
  ...overrides,
});

describe('Drone-Invaders Phase 3 rule-based assistant', () => {
  test('assistant UI scaffold includes warnings, route hints, overlay cells, and debug toggles', () => {
    const output = tickDroneInvaders({ deltaMs: 16, world: createWorld() });

    expect(output.execution.assistantUi.warnings.length).toBeGreaterThan(0);
    expect(output.execution.assistantUi.routeHints.length).toBeGreaterThan(0);
    expect(output.execution.assistantUi.dangerOverlay.length).toBeGreaterThan(0);
    expect(output.execution.assistantUi.debug.showDangerOverlay).toBe(true);
    expect(output.execution.assistantUi.debug.showRouteHints).toBe(true);
  });

  test('assistant route hints are capped to avoid HUD overload', () => {
    const crowdedWorld = createWorld({
      resources: Array.from({ length: 6 }, (_, index) => ({
        id: `resource-${index}`,
        position: { x: index + 1, y: 2 },
        richness: 0.5,
        contested: false,
      })),
    });

    const output = tickDroneInvaders({ deltaMs: 16, world: crowdedWorld });

    expect(output.execution.assistantUi.routeHints.length).toBeLessThanOrEqual(3);
  });

  test('standalone assistant scaffold mirrors policy-driven debug toggles', () => {
    const output = tickDroneInvaders({ deltaMs: 16, world: createWorld() });
    const scaffold = createAssistantUiScaffold(createWorld(), output.interpretation, output.policy);

    expect(scaffold.debug.showPolicyReasons).toBe(output.policy.reasons.length > 0);
  });
});
