import { MapSchema, Ruleset, SpriteAtlas, RenderBatch, EngineSnapshot, TiltInput, ButtonInput, PlayerState, GhostState } from '@pacman/shared';
import { MovementSystem } from './systems/MovementSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { GhostAISystem } from './systems/GhostAISystem';
import { MapLoader } from './loaders/MapLoader';
import { SpriteLoader } from './loaders/SpriteLoader';
import { RulesLoader } from './loaders/RulesLoader';

export type GameState = {
  player: PlayerState;
  ghosts: GhostState[];
  pelletsRemaining: number;
  inputs: { tilt?: TiltInput; button?: ButtonInput };
};

export const createGameState = (): GameState => ({
  player: {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    lives: 3,
    score: 0,
  },
  ghosts: [],
  pelletsRemaining: 0,
  inputs: {},
});

export const tickGame = ({
  state,
  map,
  rules,
  delta,
  sprites,
}: {
  state: GameState;
  map: MapSchema;
  rules: Ruleset;
  delta: number;
  sprites?: SpriteAtlas;
}): { snapshot: EngineSnapshot; renderBatch: RenderBatch } => {
  MovementSystem.integrate(state, map, rules, delta);
  CollisionSystem.resolve(state, map, rules);
  GhostAISystem.update(state, map, rules, delta);

  const renderBatch: RenderBatch = {
    camera: state.player.position,
    commands: SpriteLoader.toRenderCommands(state, sprites),
    hud: { score: state.player.score, lives: state.player.lives, level: map.id },
  };

  const snapshot: EngineSnapshot = {
    player: state.player,
    ghosts: state.ghosts,
    pelletsRemaining: state.pelletsRemaining,
    timestamp: Date.now(),
  };

  return { snapshot, renderBatch };
};

export const loadMap = (raw: unknown): MapSchema => MapLoader.parse(raw);
export const loadSprites = (raw: unknown): SpriteAtlas => SpriteLoader.parse(raw);
export const loadRules = (raw: unknown): Ruleset => RulesLoader.parse(raw);

export * from './legacy';
