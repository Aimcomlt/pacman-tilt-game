import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RenderBatch } from '@pacman/shared';

export type RenderState = {
  batch: RenderBatch | null;
};

const initialState: RenderState = {
  batch: null,
};

const renderSlice = createSlice({
  name: 'render',
  initialState,
  reducers: {
    setRenderBatch: (state, action: PayloadAction<RenderBatch>) => {
      state.batch = action.payload;
    },
  },
});

export const { setRenderBatch } = renderSlice.actions;
export default renderSlice.reducer;
