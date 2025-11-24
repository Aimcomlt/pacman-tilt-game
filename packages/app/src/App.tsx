import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, selectRenderBatch, pushTiltToEngine, initializeEngine, changeDirection, setTilt } from './store';
import { CanvasRenderer } from './components/CanvasRenderer';
import { HUD } from './components/HUD';
import { useTilt } from './hooks/useTilt';

const AppRoot = () => {
  const dispatch = useDispatch();
  const renderBatch = useSelector(selectRenderBatch);
  const { tilt, direction } = useTilt();

  useEffect(() => {
    dispatch(initializeEngine());
  }, [dispatch]);

  useEffect(() => {
    if (tilt) {
      dispatch(setTilt(tilt));
      dispatch(pushTiltToEngine(tilt));
    }
  }, [dispatch, tilt]);

  useEffect(() => {
    dispatch(changeDirection(direction));
  }, [dispatch, direction]);

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
