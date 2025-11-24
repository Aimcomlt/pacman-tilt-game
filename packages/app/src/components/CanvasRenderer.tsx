import React, { useEffect, useRef } from 'react';
import { RenderBatch } from '@pacman/shared';

export type CanvasRendererProps = {
  batch: RenderBatch;
};

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({ batch }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    batch.commands.forEach((cmd) => {
      if (cmd.type === 'sprite') {
        ctx.fillStyle = cmd.spriteId === 'pacman' ? 'yellow' : 'red';
        ctx.fillRect(cmd.position.x * 10, cmd.position.y * 10, 10, 10);
      }
      if (cmd.type === 'tile') {
        ctx.fillStyle = cmd.tile === 1 ? 'blue' : cmd.tile === 3 ? 'orange' : 'white';
        ctx.fillRect(cmd.position.x * 10, cmd.position.y * 10, 10, 10);
      }
    });
  }, [batch]);

  return <canvas ref={canvasRef} width={320} height={240} />;
};
