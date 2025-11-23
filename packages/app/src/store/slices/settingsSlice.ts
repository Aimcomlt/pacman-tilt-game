import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SettingsState = {
  sound: boolean;
  haptics: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
};

const initialState: SettingsState = {
  sound: true,
  haptics: true,
  difficulty: 'normal',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSound: (state, action: PayloadAction<boolean>) => {
      state.sound = action.payload;
    },
    setHaptics: (state, action: PayloadAction<boolean>) => {
      state.haptics = action.payload;
    },
    setDifficulty: (state, action: PayloadAction<SettingsState['difficulty']>) => {
      state.difficulty = action.payload;
    },
  },
});

export const { setSound, setHaptics, setDifficulty } = settingsSlice.actions;
export default settingsSlice.reducer;
