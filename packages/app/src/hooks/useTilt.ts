import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Direction, TiltInput, Vector2 } from '@pacman/shared';
import { RootState } from '../store';

type TiltState = { tilt: TiltInput | null; direction: Direction };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const normalize = (raw: Vector2): Vector2 => {
  const magnitude = Math.max(1, Math.sqrt(raw.x * raw.x + raw.y * raw.y));
  return { x: raw.x / magnitude, y: raw.y / magnitude };
};

const toDirection = (vector: Vector2, deadZone = 0.2): Direction => {
  const x = vector.x;
  const y = vector.y;
  if (Math.abs(x) < deadZone && Math.abs(y) < deadZone) return 'none';

  if (Math.abs(x) > Math.abs(y)) {
    return x > 0 ? 'right' : 'left';
  }

  return y > 0 ? 'down' : 'up';
};

export const useTilt = (enabled = true): TiltState => {
  const calibration = useSelector((state: RootState) => state.tilt.calibration);
  const [tiltState, setTiltState] = useState<TiltState>({ tilt: null, direction: 'none' });
  const lastUpdateRef = useRef(-Infinity);
  const smoothedRef = useRef<Vector2>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return undefined;

    const SMOOTHING = 0.2;
    const THROTTLE_MS = 75;
    const DEAD_ZONE = 0.15;

    const handleSample = (rawInput: Vector2) => {
      const now = performance.now();
      if (now - lastUpdateRef.current < THROTTLE_MS) return;

      const adjusted = {
        x: clamp(rawInput.x - calibration.x, -1, 1),
        y: clamp(rawInput.y - calibration.y, -1, 1),
      };

      const smoothed = {
        x: smoothedRef.current.x + (adjusted.x - smoothedRef.current.x) * SMOOTHING,
        y: smoothedRef.current.y + (adjusted.y - smoothedRef.current.y) * SMOOTHING,
      };

      const normalized = normalize(smoothed);
      const direction = toDirection(normalized, DEAD_ZONE);

      smoothedRef.current = smoothed;
      lastUpdateRef.current = now;
      setTiltState({ tilt: { raw: adjusted, normalized, timestamp: now }, direction });
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta == null || event.gamma == null) return;
      const raw: Vector2 = { x: clamp((event.gamma ?? 0) / 90, -1, 1), y: clamp((event.beta ?? 0) / 90, -1, 1) };
      handleSample(raw);
    };

    const cleanupFns: (() => void)[] = [];

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation);
      cleanupFns.push(() => window.removeEventListener('deviceorientation', handleOrientation));
    } else {
      void import('expo-sensors')
        .then(({ Accelerometer }) => {
          Accelerometer.setUpdateInterval(THROTTLE_MS);
          const subscription = Accelerometer.addListener((data) => {
            const raw: Vector2 = { x: clamp(data.x ?? 0, -1, 1), y: clamp((data.y ?? 0) * -1, -1, 1) };
            handleSample(raw);
          });
          cleanupFns.push(() => subscription.remove());
        })
        .catch(() => {
          // If accelerometer is unavailable, keep the hook silent.
        });
    }

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [calibration, enabled]);

  return tiltState;
};
