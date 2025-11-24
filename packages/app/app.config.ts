import 'dotenv/config';
import { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.pacman.dev';
  const enableTilt = process.env.EXPO_PUBLIC_ENABLE_TILT !== 'false';

  return {
    ...config,
    name: 'Pacman Tilt Game',
    slug: 'pacman-tilt-game',
    version: '0.1.0',
    extra: {
      apiBaseUrl,
      enableTilt,
    },
    experiments: {
      typedRoutes: true,
    },
  };
};
