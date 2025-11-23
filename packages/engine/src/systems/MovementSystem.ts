import { MapSchema, Ruleset, Vector2 } from '@pacman/shared';
import { GameState } from '..';

const clampVelocity = (value: number, max: number) => Math.max(-max, Math.min(max, value));

export const MovementSystem = {
  integrate(state: GameState, _map: MapSchema, rules: Ruleset, delta: number) {
    const tilt = state.inputs.tilt?.normalized ?? { x: 0, y: 0 };
    const speed = 0.002 * rules.tickRate;
    const vx = clampVelocity(state.player.velocity.x + tilt.x * speed, 1);
    const vy = clampVelocity(state.player.velocity.y + tilt.y * speed, 1);

    const deltaSeconds = delta / 1000;
    state.player.velocity = { x: vx, y: vy };
    state.player.position = add(state.player.position, scale(state.player.velocity, deltaSeconds));
  },
};

const add = (a: Vector2, b: Vector2): Vector2 => ({ x: a.x + b.x, y: a.y + b.y });
const scale = (a: Vector2, s: number): Vector2 => ({ x: a.x * s, y: a.y * s });
