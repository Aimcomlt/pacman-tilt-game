export { detectCollisions } from './collisions';
export { moveGhost, movePlayer, availableDirections } from './movement';
export { chooseDirection } from './ghostAI';
export { bfsNextDirection, distanceBetweenPositions } from './pathfinding';
export { buildMapGraph, positionKey } from './mapGraphBuilder';
export { createInitialState, tick } from './tick';
export { loadMap as loadLegacyMap, type MapJSON } from './mapLoader';
export { loadSprites as loadLegacySprites, type SpriteJSON } from './spriteLoader';
export type {
  Direction,
  GameState as LegacyGameState,
  GhostState as LegacyGhostState,
  MapDefinition,
  MapGraph,
  PlayerState as LegacyPlayerState,
  Position,
  SpriteDefinition,
  TickInput,
  TileType,
} from './types';
