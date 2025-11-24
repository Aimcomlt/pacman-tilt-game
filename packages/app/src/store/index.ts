import { configureStore } from '@reduxjs/toolkit';
import gameReducer, {
  advanceTick,
  loadLevel,
  moveGhost,
  movePacman,
  pauseGame,
  resetGame,
  resolveCollisions,
  selectRenderBatch,
  setGhostAiEnabled,
  setGhostMode,
  startGame,
} from './slices/gameSlice';
import settingsReducer from './slices/settingsSlice';
import tiltReducer, { changeDirection, setCalibration, setTilt } from './slices/tiltSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    settings: settingsReducer,
    tilt: tiltReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export {
  advanceTick,
  changeDirection,
  loadLevel,
  moveGhost,
  movePacman,
  pauseGame,
  resetGame,
  resolveCollisions,
  selectRenderBatch,
  setCalibration,
  setGhostAiEnabled,
  setGhostMode,
  setTilt,
  startGame,
};
