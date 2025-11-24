import { SpriteDefinition } from './types';

export interface SpriteJSON {
  playerSpeed?: number;
  ghostSpeed?: number;
  frightenedSpeed?: number;
  frightenedTicks?: number;
  pelletScore?: number;
  powerPelletScore?: number;
}

const DEFAULT_SPRITES: Required<SpriteJSON> = {
  playerSpeed: 1,
  ghostSpeed: 0.9,
  frightenedSpeed: 0.6,
  frightenedTicks: 50,
  pelletScore: 10,
  powerPelletScore: 50,
};

export function loadSprites(spriteData: SpriteJSON = {}): SpriteDefinition {
  const config = { ...DEFAULT_SPRITES, ...spriteData };
  return {
    playerSpeed: config.playerSpeed,
    ghostSpeed: config.ghostSpeed,
    frightenedSpeed: config.frightenedSpeed,
    frightenedTicks: config.frightenedTicks,
    pelletScore: config.pelletScore,
    powerPelletScore: config.powerPelletScore,
  };
}
