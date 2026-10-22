# core/project-overview Specification

## Purpose
Describes the project goals, technology stack, target application structure, and key facts about what we are building.

## Requirements

### Requirement: Project is an interactive English-learning platform
The system SHALL be a web application that teaches English through fragments of movies and TV shows. Each lesson is a self-contained learning unit that presents video clips, vocabulary terms, and interactive mini-games.

#### Scenario: Lesson page structure
- **WHEN** a user navigates to a lesson
- **THEN** the system displays sections in order: header, text, video players, dialogues, minigames, and closing message

### Requirement: React 19 with TypeScript strict mode
The application SHALL be built with React 19 and TypeScript (strict mode). React owns the page layout, routing, and embeddable module integration.

#### Scenario: TypeScript compilation
- **WHEN** the project builds
- **THEN** TypeScript strict mode rejects any code with implicit any, unassigned types, or unsound patterns

### Requirement: Vite-based project initialization
The project SHALL be scaffolded with `npm create vite@latest . -- --template react-ts` and NOT with `npx create-react-router@latest` (which creates nested directories conflicting with asset structure).

#### Scenario: Project directory structure
- **WHEN** the project is initialized
- **THEN** the root contains package.json, vite.config.ts, tsconfig.json, index.html, public/assets/, and src/ in a flat layout

### Requirement: react-router v7 for routing
The application SHALL use react-router v7 for client-side routing. Routes are defined in `src/routes.ts` following the official guide. The primary route is `/lesson/:id`.

#### Scenario: Lesson route
- **WHEN** a user navigates to /lesson/1
- **THEN** the system loads public/assets/lesson_1/config.json and renders the corresponding lesson page

### Requirement: Assets are organized by lesson
Each lesson lives in a dedicated directory: `public/assets/lesson_<N>/` containing:
- `config.json` — root configuration of page sections
- `terms.json` — timecodes and term vocabulary cards (for clipslesson sections)
- `script.txt` — scene dialogue by character (for dialogues sections)
- `img/` — lesson images (may be absent during development)
- `video/` — video files (may be absent during development)

#### Scenario: Lesson 1 structure
- **WHEN** loading lesson 1
- **THEN** the system reads from public/assets/lesson_1/config.json, public/assets/lesson_1/terms.json, and public/assets/lesson_1/script.txt

### Requirement: Minigame assets are shared across lessons
All minigames live under `public/assets/minigame/` in game-specific subdirectories. Each game type has its own `gameConfig.json` and optional assets (texture, sound).

#### Scenario: Coin game assets
- **WHEN** loading a minigame section with gameType="coin"
- **THEN** the system reads from public/assets/minigame/coin/gameConfig.json and loads any textures or sounds specified in that config

### Requirement: Node.js ≥ 20 and npm package manager
The project requires Node.js version 20 or later. The package manager is npm only (no yarn, pnpm, etc).

#### Scenario: Project setup
- **WHEN** a developer clones the project
- **THEN** they run npm install with Node.js ≥ 20 to install dependencies

### Requirement: No global package installation
Installation, builds, and development occur entirely within the project folder. No global npm packages or system-wide installations are used.

#### Scenario: Development command
- **WHEN** the developer runs build or dev commands
- **THEN** all dependencies are read from node_modules/ inside the project; no global tools are invoked
