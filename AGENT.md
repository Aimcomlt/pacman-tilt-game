# AGENT.md

## Project
Drone-Invaders

Arcade-strategy game inspired by retro space combat, with a triangle ship, hostile sectors, under-fire resource extraction, fortification, map expansion, and a shipboard AI assistant powered by narrow neural-network modules.

---

## Purpose of this File
This file tells coding agents and contributors how to work on this repository.

The goal is not just to make features “work.” The goal is to protect the game’s design intent:
- clarity
- mastery
- tension
- recovery
- ownership
- social identity
- fair rewards

When making tradeoffs, prefer readability, determinism, and testability over novelty.

---

## Core Design Thesis
Every minute, the player should choose between survival now and growth later.

The core gameplay loop is:
1. Fight
2. Extract
3. Fortify
4. Expand

All new features should strengthen at least one part of this loop without seriously weakening another.

---

## Product Principles
1. Rules create trust.
2. Conway creates variety.
3. Neural networks create interpretation and recommendation.
4. Hard-coded policy defines legality and fairness.
5. The player should feel assisted, not replaced.
6. The game must remain readable under pressure.
7. Networks are assistants, not rulers.

---

## What the Neural Systems Are For
Neural networks in this project are intended to act as the ship’s onboard assistant.

They may:
- interpret map structure
- classify Conway patterns
- estimate risk
- score resource opportunities
- forecast invasion pressure
- recommend routes or defensive locations
- generate heat maps or advisory signals

They must not:
- bypass hard safety or fairness rules
- directly create impossible situations
- replace deterministic pathfinding
- replace explicit legality checks
- silently override core design constraints

Use narrow, specialized models rather than one large model.

---

## Architectural Rule of Thumb
Use the right tool for each job.

Use deterministic code for:
- pathfinding
- collision
- exact distances
- legality checks
- hard event limits
- safe-path validation
- spawn exclusions
- economy math
- progression logic

Use neural models for:
- fuzzy classification
- soft scoring
- semantic interpretation
- pressure estimation
- recommendation ranking
- heat map generation

Use Conway for:
- emergent spatial patterns
- hazard candidate shapes
- resource field candidates
- moving instability fronts
- event tendency sources

---

## Required Layering
All gameplay logic should respect this flow:

### World Signal Layer
Raw map state, Conway state, entity state, run state.

### Interpretation Layer
Pattern extraction, feature extraction, neural scoring, semantic labels.

### Policy Layer
Fairness rules, legality checks, min/max limits, pacing clamps.

### Execution Layer
Spawns, events, UI advice, route overlays, hazard placement, resource placement.

Do not let interpretation skip the policy layer.

---

## Repository Working Style
When contributing code:
- keep changes small and scoped
- avoid broad rewrites unless explicitly required
- preserve existing behavior unless the task is to change it
- document assumptions
- prefer explicit names over clever abstractions
- add TODOs only when they are actionable and scoped
- avoid introducing hidden coupling across systems

When changing behavior:
- state what changed
- state why it changed
- state what system it touches
- state how it can be tested

---

## Code Quality Expectations
Prefer:
- simple modules
- composable systems
- pure functions for evaluators and scorers
- deterministic fallbacks
- serializable config
- explicit thresholds and weights
- testable data contracts

Avoid:
- magic numbers buried in code
- neural logic mixed directly into rendering or input code
- one-off exceptions without explanation
- global state with unclear ownership
- hard-to-debug “smart” behaviors

---

## Brain.js Usage Guidance
Treat Brain.js as an implementation detail behind project-owned interfaces.

Wrap all model calls behind adapters such as:
- `evaluateSectorRisk()`
- `classifyConwayPattern()`
- `forecastInvasionPressure()`
- `scoreResourceRoute()`

Do not spread direct model invocation across unrelated systems.

Model inputs and outputs must be:
- documented
- normalized where needed
- versioned when changed
- easy to log for debugging

Every neural output should have a deterministic fallback path.

---

## Conway Integration Guidance
Conway is a pattern generator, not a game designer.

Use Conway to produce candidate structures such as:
- floor hazard shapes
- corruption zones
- resource patches
- pulse fields
- moving fronts
- event source regions

Then:
1. extract features
2. classify or score the pattern
3. apply hard policy checks
4. convert only valid outputs into game content

Known Conway motifs may be detected with explicit logic before or alongside neural interpretation.

Examples:
- stable structures
- oscillators
- gliders
- emitter-like regions
- dense chaotic zones

Use explicit pattern detection where it is simpler and more reliable than training.

---

## Policy Layer Requirements
The policy layer is mandatory for all gameplay-affecting outputs.

Policies may include:
- minimum safe path count
- safe spawn radius
- maximum hazard coverage
- maximum hazard region size
- minimum separation between objective and extreme hazard
- no stacked early-game overload events
- no recovery denial chains
- event cooldown spacing
- resource accessibility rules

If a network output conflicts with policy, policy wins.

---

## Preferred Neural Assistant Modules
The default architecture should support small, narrow modules.

Suggested modules:
- Map Surveyor
- Conway Interpreter
- Threat Forecaster
- Resource Assessor
- Recovery Advisor
- Assistant Synthesizer

Each module should have:
- explicit inputs
- explicit outputs
- a bounded responsibility
- policy-clamped effects
- a debug mode with logged reasoning signals where possible

---

## Heat Map / Blackboard Pattern
Prefer a shared intermediate representation for assistant systems.

Examples:
- danger heat map
- resource value heat map
- navigability heat map
- event pressure heat map
- recovery opportunity heat map
- fortification suitability heat map

These maps may be combined into player-facing advice, but the raw layers should remain inspectable for debugging.

---

## Gameplay Priority Order
When choosing what to fix or build first, use this order:

1. Ship feel
2. Threat readability
3. Extraction tension
4. Recovery from failure
5. Fortification usefulness
6. Expansion meaning
7. Assistant usefulness
8. Content variety
9. Meta progression depth

Do not add complexity before clarity.

---

## Feature Acceptance Rule
A feature should usually satisfy all of the following:
- solves a real player or system problem
- supports at least one core pillar
- does not create major clarity debt
- can be tested in isolation
- has a rollback path
- fits the current milestone

Reject or reduce features that:
- duplicate an existing system
- make the assistant feel omniscient
- hide important state from the player
- create unfair randomness
- increase content surface without improving the loop

---

## Implementation Discipline
Before coding:
- read the relevant section of `execplan.md`
- identify the affected subsystem
- identify whether the task is deterministic, interpretive, or policy-related
- preserve system boundaries

During coding:
- implement the smallest viable version first
- keep configuration external where practical
- add debug hooks for neural outputs and policy decisions
- avoid mixing prototype logic with production logic

After coding:
- verify the feature against the design thesis
- confirm policy layer still clamps unsafe output
- note any new tuning knobs or open questions

---

## Testing Expectations
Every meaningful change should be testable.

Prioritize tests for:
- policy enforcement
- safe-path validation
- Conway interpretation outputs
- map scoring stability
- event intensity clamping
- resource placement legality
- deterministic fallback behavior

Where unit tests are impractical, provide:
- reproducible seed cases
- debug visualizations
- logged before/after outputs
- manual verification steps

---

## Debugging Requirements
Neural-assisted systems must be debuggable.

Preferred debug outputs:
- input feature dump
- model output scores
- post-policy clamped values
- rejected candidate reasons
- selected candidate reasons
- heat map overlays
- seed reproduction info

If a system cannot explain why something happened, it is not ready.

---

## Documentation Requirements
When adding or changing a subsystem, update the relevant docs:
- `execplan.md`
- architecture notes
- config documentation
- model input/output schema
- debug instructions if applicable

Keep docs aligned with actual code behavior.

---

## Non-Goals
Do not optimize for:
- artificial intelligence for its own sake
- fully autonomous gameplay control
- maximum simulation complexity
- replacing readable design with opaque adaptation
- giant unified models
- overfitting early prototypes

The assistant should improve the game’s clarity and tension, not make the game harder to understand.

---

## Output Style for Coding Agents
When completing a task, report:
1. What changed
2. Why it changed
3. Files touched
4. Risks or follow-ups
5. How to test it

Keep reports concrete and implementation-focused.

---

## Preferred Default Direction
If the next step is ambiguous, prefer:
- deterministic scaffolding first
- neural modules second
- player-facing polish after usefulness is proven

Build the assistant in this order unless directed otherwise:
1. rule-based assistant scaffolding
2. Conway feature extraction
3. Conway interpretation module
4. map surveyor
5. threat forecasting
6. resource assessment
7. assistant synthesis and UI refinement

---

## Final Rule
The ship assistant should read the battlefield faster than the player can, then surface the most useful truths.

It should help the player make better decisions without removing uncertainty, fairness, or agency.
