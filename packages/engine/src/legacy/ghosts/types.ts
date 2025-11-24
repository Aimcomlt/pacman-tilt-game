import { MapDefinition, PlayerState, Position, GhostState } from '../types';

export type GhostId = 'blinky' | 'pinky' | 'inky' | 'clyde' | string;

export interface GhostContext {
  ghost: GhostState;
  player: PlayerState;
  map: MapDefinition;
  ghosts: GhostState[];
}

export interface GhostStrategy {
  id: GhostId;
  getChaseTarget(context: GhostContext): Position;
  getScatterTarget(context: GhostContext): Position;
  getFrightenedTarget?(context: GhostContext): Position;
}
