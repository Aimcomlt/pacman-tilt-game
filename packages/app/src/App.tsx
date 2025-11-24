import React, { useEffect, useRef } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import {
  RootState,
  store,
  selectRenderBatch,
  changeDirection,
  setTilt,
  advanceTick,
  movePacman,
  resolveCollisions,
  loadLevel,
  startGame,
} from './store';
import { CanvasRenderer } from './components/CanvasRenderer';
import { HUD } from './components/HUD';
import { useTilt } from './hooks/useTilt';
import { levelLoader } from './store/levelLoader';
import { env } from './config/env';
import { useGameLoop } from './gameLoop';

const AppRoot = () => {
  const dispatch = useDispatch();
  const renderBatch = useSelector(selectRenderBatch);
  const { tilt, direction } = useTilt(env.enableTiltInput);
  const gameStatus = useSelector((state: RootState) => state.game.status);
  const directionRef = useRef(direction);

  const { start, stop } = useGameLoop((deltaMs) => {
    dispatch(advanceTick({ deltaMs }));
    const currentDirection = directionRef.current;
    if (currentDirection !== 'none') {
      dispatch(movePacman(currentDirection));
      dispatch(resolveCollisions());
    }
  });

  useEffect(() => {
    dispatch(loadLevel(levelLoader.loadDefault()));
    dispatch(startGame());
  }, [dispatch]);

  useEffect(() => {
    if (tilt) {
      dispatch(setTilt(tilt));
    }
  }, [dispatch, tilt]);

  useEffect(() => {
    directionRef.current = direction;
    dispatch(changeDirection(direction));
  }, [direction, dispatch]);

  useEffect(() => {
    if (gameStatus === 'running') {
      start();
    } else {
      stop();
    }
  }, [gameStatus, start, stop]);

  return (
    <>
      <CanvasRenderer batch={renderBatch} />
      <HUD />
    </>
  );
};

export const App = () => (
  <Provider store={store}>
    <AppRoot />
  </Provider>
);

export default App;
