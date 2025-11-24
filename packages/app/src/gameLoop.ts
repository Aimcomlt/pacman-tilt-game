import { useCallback, useEffect, useRef, useState } from 'react';

type FrameCallback = (deltaMs: number) => void;

const DEFAULT_TIMESTEP_MS = 1000 / 60;

const getFrameRequester = () => {
  if (typeof requestAnimationFrame === 'function') return requestAnimationFrame;
  return (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), DEFAULT_TIMESTEP_MS) as unknown as number;
};

const getFrameCanceller = () => {
  if (typeof cancelAnimationFrame === 'function') return cancelAnimationFrame;
  return (id?: number | NodeJS.Timeout) => clearTimeout(id as NodeJS.Timeout);
};

/**
 * Fixed timestep game loop leveraging requestAnimationFrame / Expo frame callbacks.
 */
export const useGameLoop = (onStep: FrameCallback, timestepMs: number = DEFAULT_TIMESTEP_MS) => {
  const [isRunning, setIsRunning] = useState(false);
  const runningRef = useRef(false);
  const frameRequester = useRef(getFrameRequester());
  const frameCanceller = useRef(getFrameCanceller());
  const callbackRef = useRef(onStep);
  const accumulatorRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    callbackRef.current = onStep;
  }, [onStep]);

  const loop = useCallback(
    (timestamp: number) => {
      if (!runningRef.current) return;

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      accumulatorRef.current += delta;

      while (accumulatorRef.current >= timestepMs) {
        callbackRef.current(timestepMs);
        accumulatorRef.current -= timestepMs;
      }

      rafIdRef.current = frameRequester.current(loop);
    },
    [timestepMs],
  );

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);
    lastTimeRef.current = null;
    accumulatorRef.current = 0;
    rafIdRef.current = frameRequester.current(loop);
  }, [loop]);

  const stop = useCallback(() => {
    if (!runningRef.current) return;
    runningRef.current = false;
    setIsRunning(false);
    if (rafIdRef.current !== null) {
      frameCanceller.current(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  return { start, stop, isRunning };
};
