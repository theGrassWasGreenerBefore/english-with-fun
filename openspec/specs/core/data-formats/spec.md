# core/data-formats Specification

## Purpose
Defines the JSON data formats for lesson content (config.json, terms.json, gameConfig.json, script.txt) and the principles of JSON-driven rendering.

## Requirements

### Requirement: config.json defines lesson sections
Each lesson has a config.json file that is an array of section objects. Each section has a `type` field that determines its rendering and an optional `contentType` for styling variants. Sections are rendered in array order.

#### Scenario: Section ordering
- **WHEN** config.json has 5 sections
- **THEN** the page renders sections 1–5 in order; reordering in config changes page layout

#### Scenario: Section types
- **WHEN** a section has type="header", "text", "playlist", "clipslesson", "minigame", "dialogues", or other
- **THEN** React dispatches to the correct section renderer

### Requirement: All sections have common fields
Each section object SHALL support optional common fields:
- `title` — section heading (rendered as <h2> above the section)
- `image` — path to an optional image
- `imageOrientation` — placement of image (left, right, top, bottom, etc.)
- `fontSize` — optional font size override (applied as em scaling to descendants)
- `imageWidth`, `imageHeight` — optional size overrides for the image

#### Scenario: Title rendering
- **WHEN** a section has `title: "Characters"`
- **THEN** React renders an <h2> with unique hash id and scroll-triggered animation

#### Scenario: Image placement
- **WHEN** a section has `image: "./img/hero.png"` and `imageOrientation: "left"`
- **THEN** React places the image on the left and content on the right

### Requirement: config.json playlist section maps to video paths
A section with type="playlist" has a `playlist` array. Each item has a `src` field (relative path to a video file) and metadata (title, subtitle, etc.). The video player reads these paths and switches videos on user interaction.

#### Scenario: Playlist item selection
- **WHEN** a playlist has 3 items with src values
- **THEN** clicking an item plays that video from the beginning; volume persists across videos

### Requirement: config.json clipslesson section maps to video and terms
A section with type="clipslesson" has:
- `clipslesson.sourceVideo` — path to a video file
- `clipslesson.terms` — path to terms.json

React loads both files and synchronizes the term overlay with video playback.

#### Scenario: Clipslesson video and terms
- **WHEN** a clipslesson section is rendered
- **THEN** React loads sourceVideo and terms.json, computes active terms by currentTime, and displays term cards

### Requirement: config.json minigame section specifies game type
A section with type="minigame" has a `gameType` field (e.g., "coin"). The minigame module is loaded from `public/assets/minigame/<gameType>/gameConfig.json`.

#### Scenario: Coin game loading
- **WHEN** a section has `type: "minigame"` and `gameType: "coin"`
- **THEN** React loads public/assets/minigame/coin/gameConfig.json and passes it to the coin module

### Requirement: config.json dialogues section references characters
A section with type="dialogues" has a `lines` field pointing to script.txt. Dialogues are rendered by parsing script.txt (format: `CHARACTER_ID|LINE`) and looking up character metadata from a Characters section (type="text", contentType="imageTiles") in the same config.json.

#### Scenario: Dialogue rendering
- **WHEN** a dialogues section is rendered and script.txt contains "peter|Hello"
- **THEN** React finds the character with id="peter" in the Characters section, applies their color and name, and renders the dialogue line

### Requirement: terms.json defines sequences and vocabulary
terms.json has two arrays:
- `sequences[]`: timecode ranges (start, end) with unique id
- `terms[]`: vocabulary cards with sequenceId reference, stillframe timecode, optional image, title, definition

Multiple terms can reference the same sequence.

#### Scenario: Term lookup by sequence
- **WHEN** video playback enters a sequence
- **THEN** React looks up all terms with matching sequenceId and displays them as navigation options

#### Scenario: Stillframe timing
- **WHEN** a user selects a term
- **THEN** React sends stillframe timecode to the video player; the player pauses and seeks to show that frame

### Requirement: gameConfig.json defines minigame parameters
Each game has a gameConfig.json specifying:
- `texture` — path to sprite/texture asset
- `sound` — path to audio asset (optional)
- `coordinates` — object with named regions (e.g., heads, tails, edge) each with x, y, width (optional), height (optional)
- `radius` — optional coin radius for certain coordinate interpretations
- `chrono` — animation timecodes synced to audio (e.g., throw, land, vibration_stop)

#### Scenario: Texture coordinate mapping
- **WHEN** gameConfig.json defines heads/tails/edge regions
- **THEN** the minigame uses these to crop the texture and render the correct side of the coin

#### Scenario: Animation timing
- **WHEN** chrono has `"throw": 0.1`, `"land": 0.4`, `"vibration_stop": 0.7`
- **THEN** the minigame triggers animations at those audio timecodes

### Requirement: script.txt is line-by-line dialogue
script.txt contains one line per line with format `CHARACTER_ID|LINE`. The CHARACTER_ID matches character metadata in the Characters section.

#### Scenario: Script parsing
- **WHEN** script.txt contains:
  ```
  peter|Hello, this is a test.
  jane|Great!
  peter|Thank you.
  ```
- **THEN** the dialogues component renders three lines with colors and names from the Characters section

### Requirement: All paths in JSON are relative
All asset paths in config.json, terms.json, and gameConfig.json are relative (./..., ../..., etc), NOT absolute. Code resolves them relative to their source file location.

#### Scenario: Relative path resolution
- **WHEN** config.json at public/assets/lesson_1/config.json has `"image": "./img/hero.png"`
- **THEN** React resolves it to public/assets/lesson_1/img/hero.png

#### Scenario: Cross-directory reference
- **WHEN** a path is `"../common/img/icon.png"`
- **THEN** React resolves it to public/assets/common/img/icon.png
