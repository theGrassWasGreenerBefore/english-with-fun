# AGENTS.md

Architectural documentation for the project. Source of truth for AI skills that write code.
Full prompts and step-by-step instructions for each role live in `.claude/commands/`.

## 1. Project Overview

An interactive platform for learning English through fragments of movies and TV shows (e.g., "Silicon Valley"). A lesson is a landing page assembled from a JSON description of sections, with embedded modules: a video player with optional playlist and term breakdowns and a WebGL mini-game (coin flip).

## 2. Technology Stack

- React 19 + TypeScript (strict mode)
- react-router v7
- Vite
- Vanilla JavaScript (ES2020+) for embeddable modules (video player, mini-game)
- WebGL 2.0 + GLSL ES 3.00

## 3. Project Structure

The project starts from scratch. Below is the target structure to be created
during development. At the time of writing, only `public/assets/` exists.

```
public/assets/
  common/img/           # shared assets (empty for now, will be added later)
  lesson_1/             # lesson data
    config.json         # root config of page sections
    terms.json          # timecodes and term cards
    script.txt          # scene dialogues
    img/                # lesson images (empty for now)
    video/              # video files (empty for now)
  minigame/             # mini-game directory
    coin/               # first mini-game
      gameConfig.json   # WebGL coin configuration
      (coin assets: texture, sound — empty for now)
src/                    # will be created during React project initialization
  types/
  components/
  modules/
  utils/
.claude/commands/       # AI skills (to be added in the next stage)
```

Root files (created during project initialization with react-ts template):
- package.json
- vite.config.ts
- tsconfig.json
- index.html

Each lesson (`lesson_1`, `lesson_2`, ...) is a self-contained data set with the same structure.

### Project Initialization

Use `npm create vite@latest . -- --template react-ts` for scaffolding in the current directory (the . symbol tells create-vite to work in the current folder, avoiding creation of nested directories).

React Router v7 is installed manually as a library:
- `npm install react-router`
- Create `src/routes.ts` and a root layout per the official guide.

Do NOT use `npx create-react-router@latest` — this command always creates a new subdirectory
and conflicts with the existing `public/assets/` structure.

## 4. Core Architecture Principles

- **JSON-Driven Content** — the entire structure and content of the page are described via
JSON. Assets are passed exclusively as relative paths (strings), not as imported files.

### Embeddable Module Interface
All vanilla modules implement a single contract. The TypeScript definition should live in `src/types/embeddable.ts`:
```ts
export interface EmbeddableModule<TConfig = unknown> {
  init(container: HTMLElement, config: TConfig): Promise<void>;
  destroy(): void;
}
```

### Method Semantics

- **`init(container, config)`** — asynchronous module initialization inside a DOM container.
The Promise resolves only after the module is fully ready:
  - Loading assets by paths from the config (textures, sounds, video).
  - Compiling shaders (for WebGL modules).
  - Initializing contexts (WebGL, Audio, Video).
  - Attaching event listeners.
  
  Until the Promise resolves, the React wrapper shows a loader/spinner.
  If initialization fails, init rejects the Promise. The React wrapper catches the error and shows a fallback UI.

- **`destroy()`** — synchronous cleanup of all module resources. Called on unmount of the
React wrapper. It must:
  - Remove all event listeners.
  - Free WebGL buffers and shaders (if any).
  - Stop and remove media elements (video, audio).
  - Clear the DOM inside the container (or leave the container empty).
  - Reset internal timers and animations.
  
  After `destroy()`, the module must be able to be re-initialized via `init` on the same
  instance (full state reset). This is required by React StrictMode, which mounts the component twice in dev mode.
  `destroy` does not throw exceptions. Internal errors are logged to `console.error` and suppressed so as not to break React unmount.

### Categories of Embeddable Modules

The project uses 3 categories of embeddable modules:

1. **Minigame** (`minigame`) — pure vanilla JS + WebGL
   - Example: coin (cylinder, physics, shaders)
   - Skill: `/skill-minigame`

2. **Video Player — Simple** (`playlist`) — vanilla JS
   - Player with video navigation (RECAP, SCENE)
   - Skill: `/skill-video-player`

3. **Video Player — API based** (`clipslesson`) — within a hybrid component
   - Layer 1 (React): markup for the component that wraps the video player and provides an overlay with 
     slide navigation, volume control, and `terms` layout
     Skill: `/skill-layout`
   - Layer 2 (vanilla JS): the same video player but without playlist or navigation UI and with API instead;
     accepts timecode and volume commands, and also shows a static frame by timecode
     Skill: `/skill-video-player`

### Division of Responsibility in `clipslesson`

**React (`/skill-layout`) owns:**
- loading and parsing `terms.json`;
- computing the active sequence and term by `currentTime`;
- UI markup: navigation, volume control, overlay, term cards;
- calling player methods (`seek`, `setVolume`, `showStillframe`).

**Vanilla player (`/skill-video-player`, headless mode) owns:**
- the `<video>` element;
- playback, pause, seek;
- applying volume;
- `showStillframe(time)` mode — pause + seek + wait for `seeked`;
- emitting events (`timeupdate`, `play`, `pause`, `volumechange`, `ended`).

**The player does not know about `terms.json` and does not decide which term is active.**
React does not touch `<video>` directly — only via the player's API.

### Section-to-Config Mapping

Sections of `config.json` reference external data by relative paths.
Skills must know where to get the config for each section type:

| Section type | Field in config.json | Path to data | Example from lesson_1 |
|------------|-------------------|---------------|-------------------|
| `minigame` | `gameType` | `minigame/<gameType>/gameConfig.json` | `"gameType": "coin"` → `minigame/coin/gameConfig.json` |
| `dialogues` | `lines` | path to script file | `"lines": "./script.txt"` |
| `playlist` | `playlist[].src` | array of video paths | `"src": "./video/episode1_recap.mp4"` |
| `clipslesson` | `clipslesson.sourceVideo` | path to video | `"sourceVideo": "./video/episode2_scene.mp4"` |
| `clipslesson` | `clipslesson.terms` | path to terms.json | `"terms": "./terms.json"` |

**Rule:** paths in JSON are relative (`./...` or `../common/...`).
Code must not hardcode file names — it should only read them from the config.

### Module Isolation

React components do not contain the logic of vanilla modules and do not import their internal dependencies. Integration happens via React wrappers that call `init`/`destroy` of the embeddable module, and via the public API (methods + events).

**Non-embeddable React section:** `dialogues` is implemented as a regular React component — it contains no vanilla logic and does not use the `EmbeddableModule` contract.

**Mixed section `clipslesson`:** contains both React UI and a vanilla headless player. The React part (UI, term logic) is a regular component. The vanilla part (player) is an embeddable module, mounted via a React wrapper that calls `init`/`destroy`.

## 5. Data Formats

Lesson data files reference each other by relative paths:

- **config.json** — the root lesson file, an array of sections (`type`-based). Different section types reference external resources (auxiliary fields: `contentType` defines a stylistic subgroup in the layout, `gameType` — the mini-game type):
  - `playlist` section → `playlist[].src` (video files)
  - `clipslesson` section → `clipslesson.sourceVideo` (video) and `clipslesson.terms` (path to `terms.json`)
  - `dialogues` section → `lines` by character (path to `script.txt`)
  - `minigame` section → the mini-game is configured via separate reusable modules (see `minigame/coin/gameConfig.json`), all games are taken from the `minigame` folder (directly inside `public/assets/`), where folders with specific games reside, each containing gameConfig.json and game assets; at the initial stage the only `gameType` is `coin`.
  - other section types (`header`, `text`) — static landing content with image paths
  - common block fields:
    - `title` — section title
    - `image` — accompanying image (optional)
    - `imageOrientation` determines the image position in the layout when `image` is present

### 5.1. Dynamic Rendering Principle

Code does not hardcode the page structure. The route `/lesson/:id` determines which `config.json` to load (according to the route configuration, which may be hardcoded for now). React reads sections from `config.json` and renders them in array order. To change content (text, `imageOrientation`, sprite positions, timings in `gameConfig.json`)  it is enough to edit the JSON — no code changes required. This rule applies to layout, video players, and minigames alike.

- **terms.json** — data for the Video Player module. Consists of two arrays:
  - `sequences[]` —  timecodes (`start`/`end`) of video segments, each with a unique `id`,
  - `terms[]` —  term cards. Each card contains a `sequenceId` that references `sequences[].id`. Multiple terms may reference the same sequence. Fields: `stillframe` (frame timecode), `image` (optional).

- **minigame/<gameType>/gameConfig.json** — configuration for the WebGL mini-game module.
The structure is common to all `minigame` but with caveats: `texture` (sprite), `radius` (optional), `coordinates` (field names optional, in this case — heads/tails/edge, internal shared fields: `x`, `y`, optional — `width`, `height`), `sound`, `chrono` (animation timecodes synced to audio assets, in this case — coin flip).

- **script.txt** —  line-by-line scene dialogue in the format `CHARACTER_ID|text`. `CHARACTER_ID` corresponds to the `id` field inside the section `type: "text"` with `contentType: "tiles"` and `title: "Characters"`. This section is rendered as a block with character cards and simultaneously serves as a reference for the Video Player module. The mapping `CHARACTER_ID ↔ tiles[].id` is established by the id field.

## 6. AI Skills

The project uses three skills in `.claude/commands/`:

- `/skill-layout` —  landing page layout (React 19), section layout, internal modules for dialogues and clipslesson
- `/skill-video-player` — video player with optional: controls, playlist, and API
- `/skill-minigame` —  WebGL mini-games (currently the first game — coin)

When working on a specific module, invoke the corresponding skill.

## 7. Important Constraints

- Assets (video, audio, images) are not loaded into the AI context. We work only with paths (strings).
- Never load the contents of `node_modules/`, `package-lock.json`, or `yarn.lock` into the context.
- At development time, media files are absent from the project. Paths in JSON may point
to non-existent files — this is normal. AI skills must not check for file existence.
- Assets will be added to the project later, during code development. They still should not be sent to the context.
- Modules are isolated: vanilla embeddable modules (such as the video player or the coin game) do not import React.
- TypeScript strict mode.
- All paths in JSON are relative (`../common/...` or `./...`).
- During project initialization, use `npm create vite@latest . -- --template react-ts`.
Package manager — npm. Node.js ≥ 20.

## 8. Workflow

1. Describe the asset structure (config.json, terms.json, script.txt, gameConfig.json for lesson_1 and minigame/coin)
2. Assign agents and skills
3. TypeScript interfaces for JSON based on assets
4. Set up project structure
5. React components (layout)
6. Video player (vanilla JS)
7. Coin (WebGL 2.0 + GLSL ES 3.00)
8. Integration

## 9. Notes for AI Assistants

- When working on a specific module, use the corresponding skill from `.claude/commands/`.
- Do not load binary assets into the context.
- Focus on code, types, and contracts.
