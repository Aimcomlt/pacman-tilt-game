import { useEffect, useState } from 'react';
import { TiltInput, Vector2 } from '@pacman/shared';

const normalize = (raw: Vector2): Vector2 => {
  const magnitude = Math.max(1, Math.sqrt(raw.x * raw.x + raw.y * raw.y));
  return { x: raw.x / magnitude, y: raw.y / magnitude };
};

export const useTilt = (): TiltInput | null => {
  const [tilt, setTilt] = useState<TiltInput | null>(null);

  useEffect(() => {
    const handler = (event: DeviceOrientationEvent) => {
      const raw: Vector2 = { x: (event.gamma ?? 0) / 90, y: (event.beta ?? 0) / 90 };
      const normalized = normalize(raw);
      setTilt({ raw, normalized, timestamp: performance.now() });
    };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, []);

  return tilt;
};
