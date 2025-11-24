import { GhostContext, GhostStrategy } from './types';
import { clampToMap } from './utils';

const blinky: GhostStrategy = {
  id: 'blinky',
  getChaseTarget: ({ player, map }: GhostContext) => clampToMap(player.position, map.width, map.height),
  getScatterTarget: ({ map }: GhostContext) => ({ x: map.width - 1, y: 0 }),
};

export default blinky;
