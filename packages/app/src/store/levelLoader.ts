import { loadMap, loadRules, loadSprites } from '@pacman/engine';
import { MapSchema, Ruleset, SpriteAtlas } from '@pacman/shared';
import mapJson from '../../../assets/maps/default.json';
import spriteJson from '../../../assets/sprites/default.json';
import rulesJson from '../../../assets/rules.json';

export type LevelContent = { map: MapSchema; sprites: SpriteAtlas; rules: Ruleset };

const parseLevel = (mapData: unknown, spriteData: unknown, rulesData: unknown): LevelContent => ({
  map: loadMap(mapData),
  sprites: loadSprites(spriteData),
  rules: loadRules(rulesData),
});

export const levelLoader = {
  loadDefault(): LevelContent {
    return parseLevel(mapJson, spriteJson, rulesJson);
  },
  fromJSON(mapData: unknown, spriteData: unknown, rulesData: unknown): LevelContent {
    return parseLevel(mapData, spriteData, rulesData);
  },
};
