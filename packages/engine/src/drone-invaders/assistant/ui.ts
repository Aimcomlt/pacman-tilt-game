import {
  DroneAssistantOverlayCell,
  DroneAssistantRouteHint,
  DroneAssistantUiScaffold,
  DroneAssistantWarning,
  DroneInterpretation,
  DronePolicyDecision,
  DroneWorldSignal,
} from '@pacman/shared';

const buildWarnings = (interpretation: DroneInterpretation, policy: DronePolicyDecision): DroneAssistantWarning[] => {
  const warnings: DroneAssistantWarning[] = [];

  if (interpretation.riskAssessment.sectorRisk >= 0.8) {
    warnings.push({
      id: 'risk-critical',
      tier: 'critical',
      message: 'Threat envelope critical. Prioritize evasive routes and emergency banking.',
    });
  } else if (interpretation.riskAssessment.sectorRisk >= 0.55) {
    warnings.push({
      id: 'risk-warning',
      tier: 'warning',
      message: 'Threat rising. Avoid overextending away from fallback lanes.',
    });
  }

  if (!policy.hasSafePath) {
    warnings.push({
      id: 'policy-no-safe-path',
      tier: 'critical',
      message: 'No safe extraction path is available under current hazard layout.',
    });
  }

  if (!policy.allowInvasionEvent) {
    warnings.push({
      id: 'policy-invasion-hold',
      tier: 'info',
      message: 'Invasion escalation held by policy safeguards.',
    });
  }

  return warnings;
};

const buildRouteHints = (world: DroneWorldSignal, interpretation: DroneInterpretation): DroneAssistantRouteHint[] => {
  const hints: DroneAssistantRouteHint[] = world.resources.map((resource) => ({
    id: `route-${resource.id}`,
    label: `Route to ${resource.id}`,
    waypoints: [
      { x: Math.floor(world.sector.width / 2), y: world.sector.height - 1 },
      resource.position,
    ],
    confidence: Math.max(0.1, 1 - interpretation.riskAssessment.extractionRisk),
  }));

  return hints.slice(0, 3);
};

const buildDangerOverlay = (world: DroneWorldSignal, interpretation: DroneInterpretation): DroneAssistantOverlayCell[] => {
  const maxCells = 25;

  return world.conway.aliveCells.slice(0, maxCells).map((cell) => ({
    ...cell,
    intensity: Math.max(0.1, Math.min(1, interpretation.riskAssessment.sectorRisk)),
  }));
};

export const createAssistantUiScaffold = (
  world: DroneWorldSignal,
  interpretation: DroneInterpretation,
  policy: DronePolicyDecision,
): DroneAssistantUiScaffold => ({
  warnings: buildWarnings(interpretation, policy),
  routeHints: buildRouteHints(world, interpretation),
  dangerOverlay: buildDangerOverlay(world, interpretation),
  debug: {
    showDangerOverlay: true,
    showRouteHints: true,
    showPolicyReasons: policy.reasons.length > 0,
  },
});
