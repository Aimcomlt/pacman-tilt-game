import { bfsNextDirection } from './pathfinding';
import { Direction, GhostState, MapDefinition, PlayerState } from './types';
import { getStrategy } from './ghosts';
import { GhostContext } from './ghosts/types';
import { clampToMap } from './ghosts/utils';

function frightenedTarget(context: GhostContext) {
  const { ghost, player, map } = context;
  const vector = {
    x: ghost.position.x - player.position.x,
    y: ghost.position.y - player.position.y,
  };
  return clampToMap(
    { x: ghost.position.x + vector.x * 2, y: ghost.position.y + vector.y * 2 },
    map.width,
    map.height
  );
}

export function chooseDirection(
  ghost: GhostState,
  player: PlayerState,
  map: MapDefinition,
  ghosts: GhostState[]
): Direction {
  const strategy = getStrategy(ghost.id);
  const context: GhostContext = { ghost, player, map, ghosts };

  const target = ghost.mode === 'scatter'
    ? strategy.getScatterTarget(context)
    : ghost.mode === 'frightened'
      ? (strategy.getFrightenedTarget?.(context) ?? frightenedTarget(context))
      : strategy.getChaseTarget(context);

  return bfsNextDirection(ghost.position, target, map);
}
