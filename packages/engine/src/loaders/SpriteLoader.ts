import { RenderCommand, SpriteAtlas } from '@pacman/shared';
import { GameState } from '..';

export const SpriteLoader = {
  parse(raw: unknown): SpriteAtlas {
    const data = raw as SpriteAtlas;
    if (!data || typeof data.version !== 'string') throw new Error('Invalid sprite atlas');
    return data;
  },

  toRenderCommands(state: GameState, atlas?: SpriteAtlas): RenderCommand[] {
    const commands: RenderCommand[] = [
      { type: 'sprite', position: state.player.position, spriteId: 'player' },
      ...state.ghosts.map((ghost) => ({ type: 'sprite', position: ghost.position, spriteId: ghost.id } as RenderCommand)),
    ];

    if (!atlas) return commands;
    Object.keys(atlas.sprites).forEach(() => {});
    return commands;
  },
};
