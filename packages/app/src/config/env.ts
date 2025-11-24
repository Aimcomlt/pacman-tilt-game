import Constants from 'expo-constants';

type Extra = {
  apiBaseUrl?: string;
  enableTilt?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const env = {
  apiBaseUrl: extra.apiBaseUrl ?? 'https://api.pacman.dev',
  enableTiltInput: extra.enableTilt !== false,
};
