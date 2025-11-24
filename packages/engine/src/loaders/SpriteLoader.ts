import { RenderCommand, SpriteAtlas, Vector2 } from '@pacman/shared';
import { GameState } from '..';

const isVector = (value: unknown): value is Vector2 => {
  if (!value || typeof value !== 'object') return false;
  const { x, y } = value as { x?: unknown; y?: unknown };
  return typeof x === 'number' && typeof y === 'number';
};

export const SpriteLoader = {
  parse(raw: unknown): SpriteAtlas {
    const data = raw as Partial<SpriteAtlas>;
    if (!data || typeof data.version !== 'string' || typeof data.basePath !== 'string' || typeof data.sprites !== 'object') {
      throw new Error('Invalid sprite atlas');
    }

    const normalizedSprites: SpriteAtlas['sprites'] = {};
    Object.entries(data.sprites ?? {}).forEach(([key, value]) => {
      const sprite = value as SpriteAtlas['sprites'][string];
      if (!sprite || !Array.isArray(sprite.frame) || sprite.frame.length !== 4) return;
      normalizedSprites[key] = {
        frame: sprite.frame as [number, number, number, number],
        anchor: isVector(sprite.anchor) ? sprite.anchor : undefined,
      };
    });

    return {
      version: data.version,
      basePath: data.basePath,
      sprites: normalizedSprites,
    };
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
