import { DroneInterpretation, DronePolicyDecision, DronePolicyReasonCode, DroneWorldSignal } from '@pacman/shared';
import { hasAnySafeResourcePath } from './safePath';

export type PolicyThresholds = {
  maxHazardCoverage: number;
  maxRiskBeforeInvasionClamp: number;
  minRiskForInvasion: number;
  minResourcesForInvasion: number;
};

const defaultThresholds: PolicyThresholds = {
  maxHazardCoverage: 0.2,
  maxRiskBeforeInvasionClamp: 0.75,
  minRiskForInvasion: 0.35,
  minResourcesForInvasion: 20,
};

const clampUnit = (value: number): number => Math.max(0, Math.min(1, value));
const REASON_MESSAGES: Record<DronePolicyReasonCode, string> = {
  hazard_coverage_exceeded: 'hazard coverage exceeded max threshold',
  no_safe_path: 'no safe path available',
  risk_below_min: 'invasion gated: risk below minimum threshold',
  resources_below_min: 'invasion gated: resources below minimum threshold',
};

export const evaluatePolicy = (
  world: DroneWorldSignal,
  interpretation: DroneInterpretation,
  thresholds: PolicyThresholds = defaultThresholds,
): DronePolicyDecision => {
  const reasonCodes: DronePolicyReasonCode[] = [];
  const addReason = (code: DronePolicyReasonCode): void => {
    if (!reasonCodes.includes(code)) {
      reasonCodes.push(code);
    }
  };

  const totalCells = Math.max(1, world.sector.width * world.sector.height);
  const hazardCoverage = interpretation.patternFeatures.hazardCandidateCells / totalCells;

  const allowHazardSpawn = hazardCoverage <= thresholds.maxHazardCoverage;
  if (!allowHazardSpawn) {
    addReason('hazard_coverage_exceeded');
  }

  const hasSafePath = hasAnySafeResourcePath(world);
  if (!hasSafePath) {
    addReason('no_safe_path');
  }

  const clampedRisk = clampUnit(
    Math.min(interpretation.riskAssessment.sectorRisk, thresholds.maxRiskBeforeInvasionClamp),
  );
  const isRiskHighEnough = clampedRisk >= thresholds.minRiskForInvasion;
  const hasEnoughResources = world.run.resourcesBanked >= thresholds.minResourcesForInvasion;

  if (!isRiskHighEnough) {
    addReason('risk_below_min');
  }
  if (!hasEnoughResources) {
    addReason('resources_below_min');
  }

  const allowInvasionEvent = hasSafePath && isRiskHighEnough && hasEnoughResources;
  const reasons = reasonCodes.map((code) => REASON_MESSAGES[code]);

  return {
    allowHazardSpawn,
    allowInvasionEvent,
    hasSafePath,
    clampedRisk,
    reasons,
    reasonCodes,
    policyLog: {
      candidateInput: {
        hazardCoverage,
        clampedRisk,
        resourcesBanked: world.run.resourcesBanked,
        hasSafePath,
      },
      thresholds: {
        maxHazardCoverage: thresholds.maxHazardCoverage,
        maxRiskBeforeInvasionClamp: thresholds.maxRiskBeforeInvasionClamp,
        minRiskForInvasion: thresholds.minRiskForInvasion,
        minResourcesForInvasion: thresholds.minResourcesForInvasion,
      },
      decision: {
        allowHazardSpawn,
        allowInvasionEvent,
      },
      reasons: reasonCodes.map((code) => ({
        code,
        message: REASON_MESSAGES[code],
      })),
    },
  };
};
