# Pac-Man Tilt Game Onboarding

Welcome! This monorepo bundles the tilt-driven Pac-Man project across four workspaces: the React Native/PWA app shell, a pure TypeScript engine, shared types/utilities, and JSON assets. Use this guide to get your environment ready and understand how the pieces fit together.

## Prerequisites
- **Node.js 18+** (matching the Expo/react-native toolchain expectations).
- **npm 9+** (the repo uses npm workspaces; Yarn is not configured).
- **Expo CLI** for local app/web runs (`npm i -g expo-cli`).

From the repo root, install all dependencies once:

```bash
npm install
```

> Tip: all workspace scripts run through the root `npm` commands listed below, so you rarely need to `cd` into packages.

## Monorepo Layout
- **packages/app** – Expo-powered React Native + web shell. Hosts the canvas renderer, Redux slices, and device tilt hooks.
- **packages/engine** – Pure TypeScript game engine with deterministic systems and render batches; no React/DOM references.
- **packages/shared** – Cross-package types (tilt inputs, render batches, entities) and math/util helpers.
- **packages/assets** – JSON maps and sprite metadata that feed the engine via validators in `shared`.
- **docs** – Architecture and onboarding references (`ARCHITECTURE.md`, this guide).

## Common Scripts
Run from the repo root:

- **Install**: `npm install` – installs workspace deps with a single lockfile.
- **Lint all packages**: `npm run lint`
- **Type-check all packages**: `npm run typecheck`
- **Test all packages**: `npm run test`
- **Full CI bundle**: `npm run ci` – lint + test + typecheck + build across workspaces.

Package-specific entry points (usually not needed directly):
- `packages/app`: `npm run start` (native), `npm run web` (web), `npm run build` (static web export).
- `packages/engine` / `packages/shared`: `npm run build`, `npm run typecheck`, `npm run lint`, `npm run test`.

## Local Development
1. **Boot dependencies**: `npm install` at root.
2. **Run the app (web)**: from root, `cd packages/app && npm run web` to launch Expo web. The app consumes the engine through workspace symlinks.
3. **Run the app (native)**: `cd packages/app && npm run start` to open the Expo dev server and pair with the desired platform.
4. **Iterate on the engine**: tests live in `packages/engine` and `packages/shared`; prefer `npm run test --workspaces` for coverage across packages.

## Engine ↔️ UI Contract
- The React app dispatches tilt and button inputs to the engine via Redux thunks, and the engine emits render batches and HUD stats back.
- Types for these contracts live in `packages/shared`; changes there should be coordinated with both `app` and `engine` consumers.

## Assets Workflow
- Level data and sprite metadata live in `packages/assets`. Each JSON file should declare version/checksum fields for runtime validation (see `docs/ARCHITECTURE.md`).
- When updating assets, keep schema changes in sync with shared validators to avoid runtime load failures.

## Pull Requests
- Ensure `npm run lint`, `npm run test`, and `npm run typecheck` pass before submitting.
- Include notes on any contract or asset schema changes that impact multiple packages.

If you get stuck, start by reviewing `docs/ARCHITECTURE.md` for the end-to-end data and rendering flow.
