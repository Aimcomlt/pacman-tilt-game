import React from 'react';
import { render } from '@testing-library/react';
import { CanvasRenderer } from '../components/CanvasRenderer';
import { selectRenderBatch } from '../store/slices/gameSlice';
import { RenderBatch } from '@pacman/shared';

describe('rendering effects', () => {
  it('draws tiles and sprites onto the canvas', () => {
    const batch: RenderBatch = {
      camera: { x: 0, y: 0 },
      commands: [
        { type: 'tile', position: { x: 0, y: 0 }, tile: 1 as number },
        { type: 'tile', position: { x: 1, y: 0 }, tile: 3 as number },
        { type: 'sprite', position: { x: 2, y: 0 }, spriteId: 'pacman' },
      ],
      hud: { score: 0, lives: 3, level: '1' },
    };

    const { unmount } = render(<CanvasRenderer batch={batch} />);

    const ctx = (HTMLCanvasElement.prototype.getContext as jest.Mock).mock.results[0].value;
    expect(ctx.fillRect).toHaveBeenCalledTimes(3);
    unmount();
  });

  it('builds a render batch from Redux game state', () => {
    const state: Parameters<typeof selectRenderBatch>[0] = {
      game: {
        status: 'running',
        levelId: 'test',
        map: {
          id: 'map-1',
          version: '1.0',
          width: 2,
          height: 2,
          tiles: [
            [1, 0],
            [2, 3],
          ],
          playerSpawn: { x: 0, y: 0 },
          ghostSpawns: [{ x: 1, y: 1 }],
        },
        rules: { pelletScore: 10, powerPelletScore: 50, ghostScore: 200, powerModeDurationMs: 5000 },
        sprites: { version: '1.0', basePath: '/', sprites: {} },
        pacman: { position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, direction: 'right', lives: 3, score: 0 },
        ghosts: [
          { id: 'ghost-1', position: { x: 1, y: 1 }, velocity: { x: 0, y: 0 }, lives: 0, score: 0, poweredUpUntil: undefined, mode: 'scatter', aiEnabled: true },
        ],
        pellets: [
          { position: { x: 0, y: 1 }, type: 'pellet' },
          { position: { x: 1, y: 1 }, type: 'power' },
        ],
        powerTimerMs: 0,
        score: 0,
        tick: { count: 0, lastDeltaMs: 0 },
      },
      settings: {} as never,
      tilt: { raw: null, normalized: null, calibration: { x: 0, y: 0 }, direction: 'none' },
    };

    const batch = selectRenderBatch(state);
    expect(batch.commands.filter((cmd) => cmd.type === 'tile')).toHaveLength(4);
    expect(batch.commands.filter((cmd) => cmd.type === 'sprite')).toHaveLength(2);
  });
});
