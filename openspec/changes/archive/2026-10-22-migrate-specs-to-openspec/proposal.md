# Proposal

## Why

The project currently documents AI-agent instructions in markdown files (CLAUDE.md, AGENTS.md, .claude/commands/*.md). These files are embedded in the codebase and difficult to version separately from implementation. By migrating to OpenSpec, we create a dedicated specification layer that can be:
- Independently versioned and audited
- Easily referenced and linked across documents
- Used as a source of truth for future changes without impacting active code execution
- More maintainable as requirements evolve

## What Changes

- Extract specification content from CLAUDE.md (sections 1-7, 9) and AGENTS.md (sections 1-7, 9) into OpenSpec capability specs
- Extract AI skill instructions from `.claude/commands/skill-*.md` into OpenSpec specs
- Preserve the original files in the codebase (they continue to work as entry points for the current development system)
- Create a comprehensive spec structure in `openspec/specs/` that mirrors the logical architecture

## Capabilities

### New Capabilities

- `core/project-overview`: Project goals, technology stack, and target project structure. Entry point for understanding what we're building.
- `core/architecture`: Core architecture principles, embeddable module interface, module categories, and responsibility division between React and vanilla layers.
- `core/data-formats`: JSON data formats (config.json, terms.json, gameConfig.json, script.txt) and JSON-driven rendering principles.
- `core/constraints`: Development constraints and rules (TypeScript strict mode, asset handling, missing media, module isolation, etc).
- `skill/layout`: React 19 application shell, routing, JSON-driven lesson layout, section rendering, dialogues, and clipslesson React layer.
- `skill/video-player`: Vanilla JS video player module, playlist mode, headless clipslesson mode, API, and lifecycle.
- `skill/minigame`: WebGL coin-flip mini-game, vanilla module pattern, texture coordinate handling, animation states, and physics.
- `workflow`: Project development workflow steps (1-8) from current AGENTS.md and CLAUDE.md.

### Modified Capabilities

(None — these are all new capabilities for this greenfield migration)

## Impact

- No impact on current code execution: CLAUDE.md and AGENTS.md remain in place
- AI skills continue to work: `.claude/commands/` remain in place, though they may reference openspec specs for canonical information
- OpenSpec becomes the authoritative specification layer for future changes, design reviews, and requirement clarity
- Future refactors and feature work can reference openspec specs to avoid breaking current implementation

