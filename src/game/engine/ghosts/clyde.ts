import { GhostContext, GhostStrategy } from './types';
import { clampToMap, manhattan } from './utils';

const clyde: GhostStrategy = {
  id: 'clyde',
  getChaseTarget: ({ ghost, player, map }: GhostContext) => {
    const distance = manhattan(ghost.position, player.position);
    if (distance <= 8) {
      return clampToMap({ x: 0, y: map.height - 1 }, map.width, map.height);
    }
    return clampToMap(player.position, map.width, map.height);
  },
  getScatterTarget: ({ map }: GhostContext) => ({ x: 0, y: map.height - 1 }),
};

export default clyde;
