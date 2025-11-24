import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Direction, TiltInput, Vector2 } from '@pacman/shared';

export type TiltState = {
  raw: Vector2 | null;
  normalized: Vector2 | null;
  calibration: Vector2;
  direction: Direction;
};

const initialState: TiltState = {
  raw: null,
  normalized: null,
  calibration: { x: 0, y: 0 },
  direction: 'none',
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
    changeDirection: (state, action: PayloadAction<Direction>) => {
      state.direction = action.payload;
    },
  },
});

export const { setTilt, setCalibration, changeDirection } = tiltSlice.actions;
export default tiltSlice.reducer;
