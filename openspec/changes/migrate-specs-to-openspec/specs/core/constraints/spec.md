# Spec Delta

## Purpose

Defines development constraints, rules, and guardrails for the project to ensure consistency, security, and maintainability.

## ADDED Requirements

### Requirement: TypeScript strict mode is mandatory
All TypeScript code SHALL compile with strict mode enabled. This includes no implicit any, proper type annotations, soundness checks, and non-null assertions only when justified.

#### Scenario: Strict compilation
- **WHEN** the project builds
- **THEN** tsc --strict passes with no errors

### Requirement: Media files may be absent during development
Video, audio, and image files referenced in JSON may not exist on disk during development. Code SHALL NOT check for file existence and SHALL NOT fail initialization because an asset is missing.

#### Scenario: Missing video during dev
- **WHEN** config.json references "./video/episode.mp4" but the file does not exist
- **THEN** the video player still initializes; it fails gracefully when the browser tries to load the missing file at runtime

#### Scenario: Texture loading failure
- **WHEN** gameConfig.json references a texture that does not exist
- **THEN** the minigame still initializes; it catches the texture load failure and renders fallback geometry

### Requirement: Asset paths are strings, not imports
Code SHALL NOT import binary assets (video, audio, images, textures) into source files. Assets are always referenced by relative path strings from JSON config.

#### Scenario: Video player source assignment
- **WHEN** a config path is "./video/episode.mp4"
- **THEN** the player sets HTMLVideoElement.src = `${basePath}/video/episode.mp4`; it does NOT do `import video from './video/episode.mp4'`

#### Scenario: WebGL texture loading
- **WHEN** gameConfig.json has `"texture": "./coin-texture.png"`
- **THEN** the minigame calls fetch(texturePath) to load the image; it does NOT do `import texture from './coin-texture.png'`

### Requirement: Vanilla embeddable modules do not import React
Vanilla modules (video player, minigames) do NOT import React or use React APIs. React integration occurs only through wrapper components and the public API.

#### Scenario: Minigame module
- **WHEN** implementing src/modules/minigame.ts
- **THEN** no React imports appear; the module is plain TypeScript with WebGL, audio, and DOM APIs

#### Scenario: Video player module
- **WHEN** implementing src/modules/videoPlayer.ts
- **THEN** no React imports appear; the module manages HTMLVideoElement and event listeners

### Requirement: Module isolation — no internal access from React
React components do NOT access vanilla module internals (private state, internal methods, or class members). Integration ONLY uses the public API contract: init(), destroy(), and public methods/events.

#### Scenario: Video player from React
- **WHEN** React clipslesson component integrates the player
- **THEN** React calls only public methods: play(), pause(), setVolume(), showStillframe(); it does NOT access player internal properties like _currentTime or _buffers

#### Scenario: Minigame event listening
- **WHEN** React wraps a minigame
- **THEN** React listens for public events; it does NOT traverse the minigame's internal animation frame logic

### Requirement: No global npm package installation
Development, builds, and deployment SHALL NOT rely on globally installed npm packages or system-wide tools. All dependencies are inside node_modules/ in the project folder.

#### Scenario: Build command
- **WHEN** a developer runs npm run build
- **THEN** the build tool is from ./node_modules/.bin/, not a global npm install -g command

#### Scenario: Dependency management
- **WHEN** a new package is added
- **THEN** npm install or npm install <package> adds it to the project; no npm install -g is used

### Requirement: Do not load node_modules, package-lock.json, or lock files into AI context
Binary dependencies and lock files SHALL NOT be analyzed or loaded into LLM context. Development uses the project code only.

#### Scenario: File reading restrictions
- **WHEN** analyzing the project
- **THEN** node_modules/, package-lock.json, yarn.lock, and pnpm-lock.yaml are not read or discussed

### Requirement: No external plugin systems, generic registries, or ECS frameworks
The project does NOT introduce universal plugin registries, entity component systems, or extensible game engines. Game-specific code (e.g., coin minigame) is allowed; generic abstractions are avoided until there is concrete reuse.

#### Scenario: Coin minigame code
- **WHEN** implementing the coin minigame
- **THEN** coin-specific logic is OK; a generic "PhysicsEngine" registry shared by all future games is NOT introduced

#### Scenario: Future game addition
- **WHEN** a second minigame is added
- **THEN** pragmatic code sharing is OK (shared utility modules); a universal game plugin system is NOT built preemptively

### Requirement: Relative paths in JSON only
All asset paths in JSON config files are relative (./..., ../...). Code resolves these paths relative to their containing file's directory. No absolute paths or global asset URL prefixes appear in JSON.

#### Scenario: Public assets directory
- **WHEN** React loads lesson_1/config.json
- **THEN** paths like "./video/episode.mp4" resolve relative to public/assets/lesson_1/; code does NOT assume assets are at /assets/lesson_1/ in a global URL space

### Requirement: Code does not hardcode page structure or asset filenames
All page structure (sections, order, fields) comes from config.json. Asset filenames (image paths, video files, texture sprites) come from JSON, never from hardcoded strings in code.

#### Scenario: Section rendering
- **WHEN** implementing a section renderer
- **THEN** the renderer reads `section.type` and `section.title` from the config object; it does NOT hardcode section names like "hero", "features", etc.

#### Scenario: Texture assignment
- **WHEN** loading a coin texture
- **THEN** the minigame reads `config.texture` from gameConfig.json; it does NOT assume the file is always named "coin.png"

### Requirement: React wrappers handle async module initialization and errors
React components wrapping embeddable modules SHALL:
- Display a loading indicator while init() is in progress
- Show error UI if init() rejects
- Call destroy() on unmount
- Handle the case where destroy() or init() errors are suppressed (logged but not thrown)

#### Scenario: Module initialization with loading state
- **WHEN** React mounts an embeddable module wrapper
- **THEN** it shows a loader until init() resolves, then shows the module; if init() rejects, it shows an error message

#### Scenario: Unmount cleanup
- **WHEN** React unmounts the wrapper component
- **THEN** it calls destroy() and does not throw even if destroy() logs errors internally
