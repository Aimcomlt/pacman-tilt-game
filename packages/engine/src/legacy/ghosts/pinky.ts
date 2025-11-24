import { GhostContext, GhostStrategy } from './types';
import { clampToMap, tilesAhead } from './utils';

const pinky: GhostStrategy = {
  id: 'pinky',
  getChaseTarget: ({ player, map }: GhostContext) =>
    clampToMap(tilesAhead(player, 4), map.width, map.height),
  getScatterTarget: () => ({ x: 0, y: 0 }),
};

export default pinky;
