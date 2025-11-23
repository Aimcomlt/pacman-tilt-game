import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EngineHost } from '@pacman/engine/src/core/EngineHost';
import { loadMap, loadSprites } from '@pacman/engine';
import { RenderBatch, TiltInput, Ruleset } from '@pacman/shared';
import mapJson from '../../../../assets/maps/default.json';
import spritesJson from '../../../../assets/sprites/default.json';
import rulesJson from '../../../../assets/rules.json';
import { RootState } from '..';

let engine: EngineHost | undefined;

export const initializeEngine = createAsyncThunk('game/initialize', async (_, { dispatch }) => {
  engine = new EngineHost(
    {
      onRender: (batch) => dispatch(setRenderBatch(batch)),
    },
    {
      now: () => performance.now(),
      requestFrame: (cb) => requestAnimationFrame(cb),
      cancelFrame: (id) => cancelAnimationFrame(id),
    },
  );

  engine.loadAssets({
    map: loadMap(mapJson as unknown),
    rules: rulesJson as Ruleset,
    sprites: loadSprites(spritesJson as unknown),
  });

  engine.start();
});

export const pushTiltToEngine = createAsyncThunk('game/pushTilt', async (tilt: TiltInput) => {
  engine?.pushTilt(tilt);
});

export type GameState = {
  status: 'idle' | 'running' | 'paused';
  level: string;
};

const initialState: GameState = {
  status: 'idle',
  level: 'default',
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setRenderBatch: (_state, _action: PayloadAction<RenderBatch>) => {},
    setStatus: (state, action: PayloadAction<GameState['status']>) => {
      state.status = action.payload;
      if (action.payload === 'paused') engine?.stop();
      if (action.payload === 'running') engine?.start();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeEngine.fulfilled, (state) => {
      state.status = 'running';
    });
  },
});

export const { setStatus, setRenderBatch } = gameSlice.actions;
export const selectRenderBatch = (state: RootState) => state.render.batch;
export default gameSlice.reducer;
