# core/architecture Specification

## Purpose
Defines the core architectural patterns, the embeddable module interface, module categories, and the responsibility division between React and vanilla JavaScript layers.

## Requirements

### Requirement: Embeddable module interface
All vanilla modules (video players, minigames) SHALL implement a standard interface with two methods: `init(container, config): Promise<void>` and `destroy(): void`. This interface enables React to integrate and control vanilla modules uniformly.

#### Scenario: Module initialization
- **WHEN** React mounts an embeddable module component
- **THEN** React calls `init()` with a DOM container and JSON config, waits for the Promise to resolve, and then considers the module ready

#### Scenario: Module cleanup
- **WHEN** React unmounts an embeddable module component
- **THEN** React calls `destroy()` to clean up all module resources; the module can be re-initialized on the same instance

### Requirement: init() is asynchronous and fully initializes the module
The `init(container, config)` method SHALL be async. It resolves only when the module is fully ready: assets loaded, contexts initialized, listeners attached, and first render complete.

#### Scenario: Asset loading
- **WHEN** init() is called with config containing asset paths
- **THEN** the module loads all assets (textures, audio, video) from those paths before resolving

#### Scenario: Error handling
- **WHEN** init() fails (missing assets, shader compilation error, or unsupported WebGL)
- **THEN** init() rejects the Promise with a useful error message; React shows error UI

### Requirement: destroy() is synchronous and fully resets the module
The `destroy()` method SHALL be synchronous, safe to call during React unmount, and remove all listeners, DOM nodes, WebGL resources, and internal state. After destroy(), the same instance SHALL be re-initializable.

#### Scenario: WebGL cleanup
- **WHEN** destroy() is called on a WebGL minigame
- **THEN** all buffers, shaders, textures, and the WebGL context are freed

#### Scenario: Audio cleanup
- **WHEN** destroy() is called on a video player or minigame with audio
- **THEN** all audio elements are stopped, sources cleared, and listeners removed

#### Scenario: Re-initialization after destroy
- **WHEN** destroy() is called and then init() is called again on the same instance
- **THEN** the module initializes as if fresh; this supports React StrictMode double-mounting in development

### Requirement: Three categories of embeddable modules
The project uses three categories of embeddable modules, each with a dedicated AI skill:

1. **Minigame**: Vanilla TypeScript + WebGL 2.0, configured per game in gameConfig.json. Skill: /skill-minigame
2. **Video Player — Simple**: Vanilla JS for playlist sections with multi-video selection and basic controls. Skill: /skill-video-player
3. **Video Player — API-based**: Headless vanilla player for clipslesson, integrated with React overlay and term logic. Skill: /skill-video-player

#### Scenario: Module categories
- **WHEN** a section in config.json has type="minigame"
- **THEN** the minigame module initializes; when type="playlist", the video player initializes in playlist mode; when type="clipslesson", the video player initializes in headless mode

### Requirement: clipslesson responsibility division
In clipslesson sections, responsibilities are divided between React and vanilla player:

**React owns**:
- Loading and parsing terms.json
- Computing active sequence and term by currentTime
- UI: navigation, volume control, overlay, term cards
- Calling player methods: play(), pause(), setVolume(), showStillframe()

**Vanilla player owns**:
- The <video> element
- Playback, pause, seek
- Volume application
- showStillframe(stillframe, framingXOffset) mode
- Event emission: sequenceOver, seeked, paused, unpaused

The player does NOT read terms.json or decide which term is active. React does NOT touch <video> directly.

#### Scenario: Term display in clipslesson
- **WHEN** a user navigates to a term
- **THEN** React computes which still frame to show, calls player.showStillframe(), and renders term cards; the player pauses and seeks without knowing about terms

#### Scenario: Volume control
- **WHEN** a user adjusts the volume slider in React
- **THEN** React calls player.setVolume(percent); the player applies volume to <video> and does not emit a volume event back to React

### Requirement: Module isolation
Vanilla embeddable modules do NOT import or depend on React. React components do NOT contain vanilla module internals. Integration occurs only through the public API (methods and events) via React wrapper components.

#### Scenario: Minigame isolation
- **WHEN** implementing the coin minigame
- **THEN** no React imports appear in the minigame module; all React integration is in a separate wrapper component

#### Scenario: Video player API
- **WHEN** the video player is used by React clipslesson
- **THEN** React calls public methods (play, pause, setVolume, showStillframe) and listens for events (sequenceOver, seeked, paused, unpaused); React does not access internal player state

### Requirement: JSON-driven content
The page structure and content are entirely defined by JSON. Assets are passed as relative path strings, not imported files. Code does NOT hardcode page structure, file names, or asset locations.

#### Scenario: Dynamic rendering
- **WHEN** config.json changes a section's title or adds/removes a section
- **THEN** the page layout updates without code changes

#### Scenario: Asset paths
- **WHEN** a config field references an asset (e.g., "image": "./img/hero.png")
- **THEN** code treats the value as a string path; it does not import or require the file in source code
