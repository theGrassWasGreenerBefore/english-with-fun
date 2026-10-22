# Spec Delta

## Purpose

Describes the project development workflow — the sequence of steps, milestones, and approach for building the application from specification through deployment.

## ADDED Requirements

### Requirement: Workflow has 8 phases
The project development follows these phases in order:
1. Asset structure description (config.json, terms.json, script.txt, gameConfig.json for lesson_1 and minigame/coin)
2. Agent and skill distribution (AGENTS.md + .claude/commands/)
3. TypeScript interfaces for JSON based on assets
4. Project structure formation (npm create vite + react-router)
5. React components (layout)
6. Video player (vanilla JS)
7. Coin minigame (WebGL 2.0 + GLSL)
8. Integration

Phases are completed sequentially; each phase depends on the prior.

#### Scenario: Phase progression
- **WHEN** phase 1 (asset description) is documented
- **THEN** phase 2 (agents/skills) can begin
- **WHEN** phase 4 (project structure) is complete
- **THEN** phases 5–7 (components) can proceed in parallel

### Requirement: Phase 1 asset structure is documented
Phase 1 produces documentation of the data formats:
- config.json structure and fields per section type
- terms.json structure (sequences and terms arrays)
- script.txt format (CHARACTER_ID|LINE)
- gameConfig.json structure (texture, sound, coordinates, chrono)
- Directory layout for public/assets/lesson_1 and minigame/coin

This documentation guides TypeScript interface design in phase 3.

#### Scenario: Phase 1 outcome
- **WHEN** phase 1 is complete
- **THEN** developers understand exactly what config.json, terms.json, script.txt, and gameConfig.json contain

### Requirement: Phase 2 assigns agent roles and skills
Phase 2 produces AGENTS.md (architectural overview and responsibility division) and .claude/commands/ skill files:
- /skill-layout (React developer role)
- /skill-video-player (Vanilla JS video developer role)
- /skill-minigame (Graphics/WebGL developer role)

These files define the "what" (spec) and "who" (role) for each module. Skills are invoked when working on specific areas.

#### Scenario: Skill usage
- **WHEN** implementing the React layout
- **THEN** the /skill-layout is invoked to receive role, responsibilities, and constraints

#### Scenario: Role separation
- **WHEN** the /skill-minigame is invoked
- **THEN** it describes WebGL and graphics responsibilities, not React or video player

### Requirement: Phase 3 defines TypeScript interfaces
Phase 3 produces TypeScript interface files in src/types/:
- src/types/config.ts — interfaces for config.json schema
- src/types/terms.ts — interfaces for terms.json schema
- src/types/embeddable.ts — the EmbeddableModule<T> interface
- src/types/gameConfig.ts — interfaces for minigame config

Interfaces are derived from the asset structure documented in phase 1.

#### Scenario: Config interface
- **WHEN** config.json has sections with type, title, image fields
- **THEN** src/types/config.ts defines Section and Config interfaces matching that schema

### Requirement: Phase 4 scaffolds the project
Phase 4 uses:
- `npm create vite@latest . -- --template react-ts` to scaffold
- `npm install react-router` to add router
- Vite dev server for hot reloading
- TypeScript strict mode enabled in tsconfig.json

The result is a runnable React app with routing.

#### Scenario: Project initialization
- **WHEN** phase 4 runs
- **THEN** `npm create vite ...` creates vite.config.ts, tsconfig.json, package.json, src/, index.html
- **AND THEN** `npm install react-router` adds v7 routing

### Requirement: Phase 5 implements React components
Phase 5 uses /skill-layout to build:
- src/routes.ts (routing configuration)
- src/components/LessonPage.tsx (lesson loader and section renderer)
- src/components/sections/* (section-specific components: Header, Text, Playlist, Clipslesson, Minigame, Dialogues, etc.)
- Global styles and layout

The /skill-layout skill provides detailed requirements and constraints.

#### Scenario: Section implementation
- **WHEN** implementing the Playlist section component
- **THEN** /skill-layout describes how to render video + sidebar, pass config to the player module, and handle item clicks

### Requirement: Phase 6 implements video player module
Phase 6 uses /skill-video-player to build:
- src/modules/videoPlayer.ts (vanilla JS embeddable module, no React)
- src/components/VideoPlayerWrapper.tsx (React wrapper for embedding)
- Playlist UI (sidebar with items, controls)
- Headless mode for clipslesson
- Event emission (sequenceOver, seeked, paused, unpaused)

The /skill-video-player skill provides detailed API, lifecycle, and mode requirements.

#### Scenario: Video player modes
- **WHEN** implementing the player
- **THEN** /skill-video-player specifies both playlist and headless modes; they share core logic

### Requirement: Phase 7 implements coin minigame module
Phase 7 uses /skill-minigame to build:
- src/modules/coinGame.ts (vanilla TypeScript + WebGL, no React)
- src/components/MinigameWrapper.tsx (React wrapper for embedding)
- WebGL 2.0 setup, shaders, geometry
- Animation states (still, ascending, descending, settling)
- Physics, texture mapping, audio sync
- Texture and audio loading with graceful degradation

The /skill-minigame skill provides detailed graphics, animation, and state-machine requirements.

#### Scenario: Minigame development
- **WHEN** implementing the coin minigame
- **THEN** /skill-minigame specifies WebGL rendering, animation timing, texture coordinate handling, and physics

### Requirement: Phase 8 integrates all modules
Phase 8 verifies:
- React components correctly call init() and destroy() on embeddable modules
- Lesson config loads from the correct paths
- Sections render in order and interact correctly
- Video player and minigame are embedded and function as intended
- No module imports cross boundaries (React not in vanilla modules, vanilla internals not in React)

#### Scenario: Integration testing
- **WHEN** phase 8 runs
- **THEN** load a full lesson, navigate sections, interact with video player and minigame, verify correct behavior

### Requirement: Workflow is iterative for bug fixes and refinements
If a bug is found in phase X, it is fixed in phase X without blocking later phases. If a design issue is found in phase Y that requires changes in phase X, those changes are made and phase Y continues.

#### Scenario: Bug fix during integration
- **WHEN** phase 8 discovers that video player events are not reaching React
- **THEN** the video player (phase 6) is debugged and fixed; integration resumes

### Requirement: Each phase uses its corresponding AI skill
When working on a phase, the corresponding skill is invoked to provide role, responsibilities, and detailed guidance:
- Phase 1 (assets): No dedicated skill; documented directly.
- Phase 2 (agents/skills): Part of project setup; AGENTS.md and CLAUDE.md guide.
- Phase 3 (interfaces): No dedicated skill; guided by phase 1 docs.
- Phase 4 (project): No dedicated skill; standard Vite + React setup.
- Phase 5 (React): Invoke /skill-layout.
- Phase 6 (video player): Invoke /skill-video-player.
- Phase 7 (minigame): Invoke /skill-minigame.
- Phase 8 (integration): No dedicated skill; orchestration and verification.

#### Scenario: Skill invocation
- **WHEN** starting phase 5
- **THEN** /skill-layout is invoked before writing React code; it provides role, constraints, and detailed requirements

### Requirement: Development constraints are enforced throughout workflow
All phases respect the constraints from core/constraints spec:
- TypeScript strict mode
- No global npm packages
- Assets as paths, not imports
- Module isolation (no React in vanilla, no vanilla internals in React)
- Missing media handled gracefully

#### Scenario: Constraint compliance
- **WHEN** any phase writes code
- **THEN** that code complies with the constraints; violations are caught during review or testing

### Requirement: Workflow produces runnable code incrementally
At the end of each phase, the project is in a runnable state (even if incomplete):
- Phase 4: Vite dev server runs, routing works, pages load.
- Phase 5: Lesson page loads and renders static sections.
- Phase 6: Video player sections show placeholders or working player.
- Phase 7: Minigame sections show placeholders or working coin game.
- Phase 8: All modules integrated and fully functional.

#### Scenario: Incremental runnable state
- **WHEN** phase 6 is complete
- **THEN** the app runs; video player works; minigame section shows placeholder until phase 7
