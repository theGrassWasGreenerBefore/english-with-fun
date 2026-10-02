# CLAUDE.md

For full architecture, data formats, and contracts, read @AGENTS.md.

## Quick Reference
- **Project:** Interactive English-learning platform (movie clips + WebGL mini-games)
- **Stack:** React 19 + TypeScript (strict), react-router v7, Vite, vanilla JS (modules), WebGL 2.0
- **Entry point:** `src/main.tsx` (to be created)
- **Lesson data:** `public/assets/lesson_1/config.json`, `terms.json`, `script.txt`
- **Mini-game config:** `public/assets/minigame/coin/gameConfig.json`
- **AI skills:** `.claude/commands/` (`/skill-layout`, `/skill-video-player`, `/skill-minigame`)

## Important
- **Do NOT load binary assets** (video, audio, images) into context. Work with paths only.
- **Do NOT load packages data** `node_modules/`, `package-lock.json`, `yarn-lock`. Work with the project code.
- **Do NOT install globally** not with npm, not with anything. Work inside the project folder only.
- **Media files are absent** during development. Paths may point to non-existent files — this is normal.
- **Modules are isolated:** vanilla embeddable modules do not import React.
- **Content is JSON-driven.** Code must not hardcode structure or file names.
- **TypeScript strict mode.**
- **Package manager:** npm. Node.js ≥ 20.

## Workflow

### Completed
1. ✅ Asset structure description (config.json, terms.json, script.txt, gameConfig.json)
2. Agent and skill distribution (AGENTS.md + .claude/commands/)
3. TypeScript interfaces for JSON based on assets
4. Project structure formation (npm create vite + react-router)

### In Progress
5. React components (layout)
6. Video player (vanilla JS)

### Upcoming
7. Coin mini-game (WebGL)
8. Integration