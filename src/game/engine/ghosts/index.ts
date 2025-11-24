import blinky from './blinky';
import clyde from './clyde';
import inky from './inky';
import pinky from './pinky';
import { GhostId, GhostStrategy } from './types';

const strategies: Record<string, GhostStrategy> = {
  blinky,
  pinky,
  inky,
  clyde,
};

export function getStrategy(id: GhostId): GhostStrategy {
  const normalized = id.toLowerCase();
  return strategies[normalized] ?? blinky;
}

export { blinky, pinky, inky, clyde };
