import { GameState } from './types';

function sameTile(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return Math.round(a.x) === Math.round(b.x) && Math.round(a.y) === Math.round(b.y);
}

export function detectCollisions(state: GameState): 'none' | 'lost' {
  const collision = state.ghosts.some((ghost) => sameTile(state.player.position, ghost.position));
  return collision ? 'lost' : 'none';
}
