import { configureStore } from '@reduxjs/toolkit';
import gameReducer, { initializeEngine, pushTiltToEngine, selectRenderBatch } from './slices/gameSlice';
import settingsReducer from './slices/settingsSlice';
import tiltReducer, { changeDirection, setTilt } from './slices/tiltSlice';
import renderReducer from './slices/renderSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    settings: settingsReducer,
    tilt: tiltReducer,
    render: renderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { initializeEngine, pushTiltToEngine, selectRenderBatch, changeDirection, setTilt };
