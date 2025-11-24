import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { MapSchema } from '@pacman/shared';
import {
  store,
  selectRenderBatch,
  changeDirection,
  setTilt,
  movePacman,
  resolveCollisions,
  loadLevel,
  startGame,
} from './store';
import { CanvasRenderer } from './components/CanvasRenderer';
import { HUD } from './components/HUD';
import { useTilt } from './hooks/useTilt';
import mapJson from '../assets/maps/default.json';

const AppRoot = () => {
  const dispatch = useDispatch();
  const renderBatch = useSelector(selectRenderBatch);
  const { tilt, direction } = useTilt();

  useEffect(() => {
    dispatch(loadLevel(mapJson as MapSchema));
    dispatch(startGame());
  }, [dispatch]);

  useEffect(() => {
    if (tilt) {
      dispatch(setTilt(tilt));
    }
  }, [dispatch, tilt]);

  useEffect(() => {
    dispatch(changeDirection(direction));
    if (direction !== 'none') {
      dispatch(movePacman(direction));
      dispatch(resolveCollisions());
    }
  }, [direction, dispatch]);

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
