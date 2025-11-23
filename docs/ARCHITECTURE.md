# Pac-Man Tilt Game Monorepo Architecture

This blueprint lays out a Yarn/NPM workspaces monorepo for a Pac-Man Tilt Game that can target React Native or React PWA. The goal is to keep the gameplay engine pure TypeScript, drive runtime configuration with JSON assets, and render through a canvas-oriented UI while Redux manages game/session state.

## Workspace Layout

```
packages/
  app/                # React Native / React PWA app shell (canvas renderer + UI)
  engine/             # Pure TypeScript gameplay engine (platform-agnostic)
  shared/             # Cross-package types and utilities
  assets/             # JSON maps, sprite atlases, rules, and palette metadata
```

Root `package.json` defines the workspaces so each package can be built/tested independently while sharing the same lockfile. CI can run `npm run lint --workspaces`, `npm run test --workspaces`, etc.

## Data Flow and Responsibilities

* **App (React UI + Redux):**
  * Owns Redux slices for session, settings, tilt calibration, and engine bridge.
  * Hosts the canvas renderer component that consumes the engine's draw commands.
  * Subscribes to device tilt/acceleration sensors and dispatches normalized tilt vectors to Redux.
  * Dispatches input actions (tilt, pause, restart) and receives frame snapshots from the engine via an event bridge.
* **Engine (Pure TS):**
  * Initializes with JSON assets resolved by the app and validated by shared schemas.
  * Exposes an imperative API (`EngineHost`) for tick/start/stop, and emits render batches and HUD stats.
  * Contains deterministic systems for movement, collisions, scoring, ghost AI, and pellet state.
  * Never touches DOM/React; all IO comes from injected callbacks and data structures.
* **Shared:**
  * Type definitions for entities, map layout, sprite metadata, events, and render commands.
  * Pure helpers for vector math, RNG, and schema validation (e.g., `zod`/`io-ts`).
* **Assets:**
  * JSON driven so level designers can change maps, rules, or sprites without code changes.
  * Each asset file declares a version and checksum to allow runtime validation.

## Cross-Package Contracts

Communication stays type-safe through `packages/shared` types and events:

* **Inputs:** `TiltInput`, `ButtonInput`, and `DebugInput` events are dispatched from Redux thunks to the engine.
* **Outputs:** Engine emits `RenderBatch` (drawable instructions for the canvas), `ScoreBoard` stats, and `SoundCue` events back to the app.
* **State:** Redux keeps minimal derived state (UI status, calibration, current level id) and stores the latest engine snapshot for time travel/debug.

## Rendering Pipeline

1. `CanvasRenderer` React component subscribes to `renderFrame` slice and paints draw calls (tiles, sprites, overlays) onto an HTML5 Canvas or React Native Skia surface.
2. `EngineHost` produces `RenderBatch` per tick. Batches include camera offset, tile layers, sprite quads, and HUD overlays, staying platform-agnostic.
3. UI overlays (pause menu, settings) remain in the React tree, separate from canvas rendering.

## Sensor Pipeline

1. `useTilt` hook wraps the platform sensor API (`DeviceOrientationEvent` on web or `expo-sensors` on Native).
2. Hook normalizes raw gravity vectors, applies calibration offsets from Redux, throttles to the engine tick rate, and dispatches `tiltSlice` actions.
3. A thunk (`pushTiltToEngine`) forwards normalized tilt to the engine host.

## Redux Slices (packages/app)

* `gameSlice`: run/pause state, current level, score summary, and engine readiness.
* `renderSlice`: latest `RenderBatch` from the engine.
* `tiltSlice`: raw sensor readings, calibration offsets, and normalized vector.
* `settingsSlice`: audio, haptics, difficulty, and accessibility preferences.

## Boot Flow

1. App boots and loads JSON assets from `packages/assets` (or remote CDN) via `AssetsLoader`.
2. Assets pass through `shared` validators and are injected into `engine.createEngine` along with Redux dispatch callbacks.
3. `EngineHost.start()` kicks off the game loop (`requestAnimationFrame` or `setInterval` with fallback), pushing render batches into Redux.
4. UI components subscribe to slices to show HUD, debug overlays, and settings.

## Testing Strategy

* Unit-test engine systems with deterministic fixtures and snapshot render batches.
* Integration-test Redux + hooks with React Testing Library and mocked sensors.
* Contract-test asset JSON via schemas to prevent malformed levels.

This blueprint is intentionally verbose to serve as a reference for contributors adding features or ports.
