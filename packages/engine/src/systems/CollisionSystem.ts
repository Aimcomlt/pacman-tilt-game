import { MapSchema, Ruleset } from '@pacman/shared';
import { GameState } from '..';

export const CollisionSystem = {
  resolve(state: GameState, map: MapSchema, rules: Ruleset) {
    const tileX = Math.round(state.player.position.x);
    const tileY = Math.round(state.player.position.y);
    const tile = map.tiles[tileY]?.[tileX];

    if (tile === 2) {
      state.player.score += rules.pelletScore;
      state.pelletsRemaining -= 1;
      map.tiles[tileY][tileX] = 0;
    }

    if (tile === 3) {
      state.player.score += rules.powerPelletScore;
      state.player.poweredUpUntil = Date.now() + rules.powerModeDurationMs;
      map.tiles[tileY][tileX] = 0;
    }
  },
};
