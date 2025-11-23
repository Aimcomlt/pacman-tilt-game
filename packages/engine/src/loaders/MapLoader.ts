import { MapSchema } from '@pacman/shared';

export const MapLoader = {
  parse(raw: unknown): MapSchema {
    const data = raw as MapSchema;
    if (!data || typeof data.id !== 'string') throw new Error('Invalid map');
    return data;
  },
};
