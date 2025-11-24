import { GhostContext, GhostStrategy } from './types';
import { clampToMap, tilesAhead } from './utils';

const inky: GhostStrategy = {
  id: 'inky',
  getChaseTarget: ({ player, map, ghosts }: GhostContext) => {
    const blinky = ghosts.find((ghost) => ghost.id === 'blinky');
    const reference = tilesAhead(player, 2);
    const origin = blinky ? blinky.position : player.position;
    const vector = {
      x: reference.x - origin.x,
      y: reference.y - origin.y,
    };
    const doubled = { x: origin.x + vector.x * 2, y: origin.y + vector.y * 2 };
    return clampToMap(doubled, map.width, map.height);
  },
  getScatterTarget: ({ map }: GhostContext) => ({ x: map.width - 1, y: map.height - 1 }),
};

export default inky;
