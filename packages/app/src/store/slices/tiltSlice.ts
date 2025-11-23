import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TiltInput, Vector2 } from '@pacman/shared';

export type TiltState = {
  raw: Vector2 | null;
  normalized: Vector2 | null;
  calibration: Vector2;
};

const initialState: TiltState = {
  raw: null,
  normalized: null,
  calibration: { x: 0, y: 0 },
};

const tiltSlice = createSlice({
  name: 'tilt',
  initialState,
  reducers: {
    setTilt: (state, action: PayloadAction<TiltInput>) => {
      state.raw = action.payload.raw;
      state.normalized = action.payload.normalized;
    },
    setCalibration: (state, action: PayloadAction<Vector2>) => {
      state.calibration = action.payload;
    },
  },
});

export const { setTilt, setCalibration } = tiltSlice.actions;
export default tiltSlice.reducer;
