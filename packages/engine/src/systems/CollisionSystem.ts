import { MapSchema, Ruleset } from '@pacman/shared';
import { GameState } from '..';

export const CollisionSystem = {
  resolve(state: GameState, map: MapSchema, rules: Ruleset) {
    const tileX = Math.round(state.player.position.x);
    const tileY = Math.round(state.player.position.y);
    const key = `${tileX},${tileY}`;
    const pellet = state.pellets[key];

    if (pellet === 2 || pellet === 3) {
      state.player.score += pellet === 3 ? rules.powerPelletScore : rules.pelletScore;
      delete state.pellets[key];
      state.pelletsRemaining = Math.max(0, state.pelletsRemaining - 1);

      if (pellet === 3) {
        state.player.poweredUpUntil = Date.now() + rules.powerModeDurationMs;
        state.ghosts = state.ghosts.map((ghost) =>
          ghost.mode === 'eyes' ? ghost : { ...ghost, mode: 'frightened' },
        );
      }
    }

    const playerPoweredUp = (state.player.poweredUpUntil ?? 0) > Date.now();
    const spawn = map.ghostSpawns[0] ?? map.playerSpawn;

    state.ghosts = state.ghosts.map((ghost) => {
      const ghostX = Math.round(ghost.position.x);
      const ghostY = Math.round(ghost.position.y);
      const overlapping = ghostX === tileX && ghostY === tileY;

      if (!overlapping || ghost.mode === 'eyes') return ghost;

      if (playerPoweredUp) {
        state.player.score += rules.ghostScore;
        return {
          ...ghost,
          mode: 'eyes',
          position: { ...spawn },
          velocity: { x: 0, y: 0 },
        };
      }

      state.player.lives = Math.max(0, state.player.lives - 1);
      state.player.position = { ...map.playerSpawn };
      state.player.velocity = { x: 0, y: 0 };
      return ghost;
    });
  },
};
