import { EngineEvents, TiltInput, ButtonInput, MapSchema, Ruleset, SpriteAtlas, RenderBatch, EngineSnapshot } from '@pacman/shared';
import { createGameState, tickGame } from '../index';

export type EngineDependencies = {
  now: () => number;
  requestFrame: (cb: () => void) => number;
  cancelFrame: (id: number) => void;
};

export class EngineHost {
  private events: EngineEvents;
  private deps: EngineDependencies;
  private state = createGameState();
  private running = false;
  private lastTick = 0;
  private map?: MapSchema;
  private rules?: Ruleset;
  private sprites?: SpriteAtlas;
  private rafId: number | null = null;

  constructor(events: EngineEvents, deps: EngineDependencies) {
    this.events = events;
    this.deps = deps;
  }

  loadAssets(payload: { map: MapSchema; rules: Ruleset; sprites: SpriteAtlas }) {
    this.map = payload.map;
    this.rules = payload.rules;
    this.sprites = payload.sprites;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTick = this.deps.now();
    const loop = () => {
      if (!this.running) return;
      const now = this.deps.now();
      const delta = now - this.lastTick;
      this.lastTick = now;
      if (this.map && this.rules) {
        const { snapshot, renderBatch } = tickGame({
          state: this.state,
          map: this.map,
          rules: this.rules,
          delta,
          sprites: this.sprites,
        });
        this.events.onRender(renderBatch as RenderBatch);
        this.events.onSnapshot?.(snapshot as EngineSnapshot);
      }
      this.rafId = this.deps.requestFrame(loop);
    };
    this.rafId = this.deps.requestFrame(loop);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.rafId !== null) this.deps.cancelFrame(this.rafId);
  }

  pushTilt(input: TiltInput) {
    this.state.inputs.tilt = input;
  }

  pushButton(input: ButtonInput) {
    this.state.inputs.button = input;
  }
}
