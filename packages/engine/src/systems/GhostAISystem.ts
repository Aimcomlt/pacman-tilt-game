import { MapSchema, Ruleset } from '@pacman/shared';
import { GameState } from '..';

export const GhostAISystem = {
  update(state: GameState, _map: MapSchema, _rules: Ruleset, delta: number) {
    state.ghosts = state.ghosts.map((ghost) => {
      const oscillation = Math.sin(delta / 500 + parseInt(ghost.id, 10));
      const nextPosition = {
        x: ghost.position.x + oscillation * 0.01,
        y: ghost.position.y + oscillation * 0.01,
      };
      return { ...ghost, position: nextPosition };
    });
  },
};
