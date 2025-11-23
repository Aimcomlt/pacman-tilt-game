import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, selectRenderBatch, pushTiltToEngine, initializeEngine } from './store';
import { CanvasRenderer } from './components/CanvasRenderer';
import { HUD } from './components/HUD';
import { useTilt } from './hooks/useTilt';

const AppRoot = () => {
  const dispatch = useDispatch();
  const renderBatch = useSelector(selectRenderBatch);
  const tilt = useTilt();

  useEffect(() => {
    dispatch(initializeEngine());
  }, [dispatch]);

  useEffect(() => {
    if (tilt) dispatch(pushTiltToEngine(tilt));
  }, [dispatch, tilt]);

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
