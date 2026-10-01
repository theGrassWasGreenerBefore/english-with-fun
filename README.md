# English with Fun

Interactive platform for learning English through movie and TV show clips.

## Overview

**English with Fun** is an educational web application that combines video content with interactive learning elements. Each lesson is a dynamic landing page where users watch scenes from popular shows (like HBO's "Silicon Valley"), explore vocabulary with synchronized term cards, and practice speaking through role-playing dialogues.

The platform is built with a **JSON-driven architecture** — all content, structure, and media references are defined in data files, making it easy to create new lessons without code changes.

## Features

- 🎬 **Video lessons** with scene breakdowns and vocabulary terms
- 📚 **Interactive term cards** synchronized with video timestamps
- 🎮 **WebGL mini-games** (e.g., coin toss for randomizing study order)
-  **Dialogue practice** with character-based role playing
- 📱 **Responsive design** for desktop and mobile

## Tech Stack

- **Frontend:** React 19 + TypeScript (strict mode)
- **Routing:** React Router v7
- **Build:** Vite
- **Graphics:** WebGL 2.0 + GLSL ES 3.00 (for mini-games)
- **Modules:** Vanilla JavaScript (ES2020+) for embeddable components

## Architecture

The project follows a **modular, JSON-driven architecture**:

- **Content as data:** Lessons are defined in JSON files (`config.json`, `terms.json`, `script.txt`). To create a new lesson, you add data files — no code changes required.
- **Embeddable modules:** Interactive components (video player, mini-games) are isolated vanilla JS modules that implement a unified `EmbeddableModule` interface. They can be mounted into React components via wrappers.
- **Separation of concerns:** React handles UI and layout; vanilla modules handle media, WebGL, and complex interactions.

### Project Structure

public/assets/
common/img/        # Shared assets
lesson_1/          # Lesson data (config, terms, script)
minigame/coin/     # Mini-game configurations
src/
components/        # React components
modules/           # Embeddable vanilla JS modules
types/             # TypeScript interfaces


## Development Status

 **In active development.** Currently working on:
- Project scaffolding (React + TypeScript + Vite)
- TypeScript interfaces for JSON data structures
- Core layout components

## Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/english-with-fun.git
cd english-with-fun

# Install dependencies
npm install

# Start development server
npm run dev
```

**Note:** Media assets (video, audio, images) are not included in the repository. The application works with file paths defined in JSON configs; assets are added separately.

## License
MIT

Built with a focus on clean architecture and maintainable code.