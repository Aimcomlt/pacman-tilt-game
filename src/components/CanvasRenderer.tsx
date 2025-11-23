import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { GameState, Position, TileType } from '../game/engine/types';

interface RootState {
  game: GameState;
}

const ghostColors: Record<GameState['ghosts'][number]['mode'], string> = {
  chase: '#ff4b4b',
  scatter: '#4bc1ff',
  frightened: '#4bffa5',
};

function isPelletTile(tile: TileType): tile is 'pellet' | 'power-pellet' {
  return tile === 'pellet' || tile === 'power-pellet';
}

const CanvasRenderer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const game = useSelector((state: RootState) => state.game);
  const gameRef = useRef(game);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const tileSize = game.map.tileSize;

  const gridToTopLeft = useCallback(
    (position: Position) => ({
      x: position.x * tileSize,
      y: position.y * tileSize,
    }),
    [tileSize]
  );

  const gridToCenter = useCallback(
    (position: Position) => ({
      x: position.x * tileSize + tileSize / 2,
      y: position.y * tileSize + tileSize / 2,
    }),
    [tileSize]
  );

  const pelletRadii = useMemo(
    () => ({
      pellet: Math.max(tileSize * 0.08, 2),
      power: Math.max(tileSize * 0.18, 4),
    }),
    [tileSize]
  );

  const drawWalls = useCallback(
    (ctx: CanvasRenderingContext2D, map: GameState['map']) => {
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(0, 0, map.width * map.tileSize, map.height * map.tileSize);

      ctx.fillStyle = '#0044ff';
      map.tiles.forEach((row, y) => {
        row.forEach((tile, x) => {
          if (tile === 'wall') {
            const { x: px, y: py } = gridToTopLeft({ x, y });
            ctx.fillRect(px, py, map.tileSize, map.tileSize);
          }
        });
      });
    },
    [gridToTopLeft]
  );

  const drawPellets = useCallback(
    (ctx: CanvasRenderingContext2D, map: GameState['map']) => {
      ctx.fillStyle = '#ffeb3b';
      map.tiles.forEach((row, y) => {
        row.forEach((tile, x) => {
          if (isPelletTile(tile)) {
            const { x: cx, y: cy } = gridToCenter({ x, y });
            const radius = tile === 'power-pellet' ? pelletRadii.power : pelletRadii.pellet;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });
    },
    [gridToCenter, pelletRadii]
  );

  const drawPlayer = useCallback(
    (ctx: CanvasRenderingContext2D, player: GameState['player']) => {
      const { x, y } = gridToCenter(player.position);
      const radius = tileSize * 0.45;
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    },
    [gridToCenter, tileSize]
  );

  const drawGhosts = useCallback(
    (ctx: CanvasRenderingContext2D, ghosts: GameState['ghosts']) => {
      ghosts.forEach((ghost) => {
        const { x, y } = gridToCenter(ghost.position);
        ctx.fillStyle = ghostColors[ghost.mode];
        ctx.beginPath();
        ctx.arc(x, y, tileSize * 0.4, Math.PI, Math.PI * 2);
        ctx.lineTo(x + tileSize * 0.4, y + tileSize * 0.4);
        ctx.lineTo(x - tileSize * 0.4, y + tileSize * 0.4);
        ctx.closePath();
        ctx.fill();
      });
    },
    [gridToCenter, tileSize]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = game.map.width * tileSize;
    canvas.height = game.map.height * tileSize;
  }, [game.map.height, game.map.width, tileSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animationFrameId: number;

    const render = () => {
      const current = gameRef.current;
      if (!current) return;

      drawWalls(ctx, current.map);
      drawPellets(ctx, current.map);
      drawGhosts(ctx, current.ghosts);
      drawPlayer(ctx, current.player);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, [drawGhosts, drawPellets, drawPlayer, drawWalls]);

  return <canvas ref={canvasRef} />;
};

export default React.memo(CanvasRenderer);
