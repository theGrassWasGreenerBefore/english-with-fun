# Spec Delta

## Purpose

Defines the React application shell, routing, JSON-driven lesson layout, section rendering, and the React layer of integrated modules (video players and minigames).

## ADDED Requirements

### Requirement: Application has react-router v7 setup with root layout
The application SHALL use react-router v7 configured in src/routes.ts. A root layout component exists to provide the navigation and page structure for all routes.

#### Scenario: Root route configuration
- **WHEN** the application starts
- **THEN** react-router loads src/routes.ts and renders the root layout

### Requirement: Lesson route loads and renders lesson page
A dynamic route `/lesson/:id` loads `public/assets/lesson_<id>/config.json`, parses it, and renders the lesson page with all sections.

#### Scenario: Lesson 1 page
- **WHEN** user navigates to /lesson/1
- **THEN** the application loads public/assets/lesson_1/config.json and renders its sections in array order

#### Scenario: Missing lesson
- **WHEN** user navigates to /lesson/999 and no such lesson exists
- **THEN** the application shows an error message

### Requirement: Section renderer dispatches by section type
A section renderer component reads each section's `type` field and dispatches to the appropriate renderer (header, text, playlist, clipslesson, minigame, dialogues, etc). Sections render in array order.

#### Scenario: Mixed section types
- **WHEN** config.json has 5 sections of different types
- **THEN** React renders each with the correct layout and logic; a playlist section shows a video with sidebar, a minigame shows a canvas, etc.

### Requirement: Common section fields (title, image, fontSize, etc.) are applied uniformly
All section types support optional common fields: title, image, imageOrientation, fontSize, imageWidth, imageHeight. These are applied to the rendered section.

#### Scenario: Section title
- **WHEN** a section has `title: "Characters"`
- **THEN** React renders an <h2> with unique hash id and scroll-triggered animation; the <h2> is placed above the section content

#### Scenario: Custom font size
- **WHEN** a section has `fontSize: "32px"`
- **THEN** React applies font-size: 32px to the section's wrapper; child elements scale accordingly

#### Scenario: Image placement
- **WHEN** a section has `image: "./img/hero.png"` and `imageOrientation: "left"`
- **THEN** React renders the image on the left side and content on the right side

### Requirement: Page layout has max-width and center alignment
Page content SHALL have a max-width of 1280px and be centered on the viewport with padding on left and right. Base font size for body text is 24px.

#### Scenario: Viewport sizing
- **WHEN** the page loads on desktop
- **THEN** content is centered with 1280px max-width; extra space appears on sides

#### Scenario: Responsive padding
- **WHEN** the viewport is narrower than 1280px
- **THEN** content takes up available space with padding; layout does not overflow

### Requirement: Tiles are square and laid out based on count
Tiles (in contentType="tiles" or "imageTiles") are square (aspect-ratio: 1/1). When a section has exactly 4 tiles, they are laid out as a 2×2 grid. Odd tile counts get a placeholder to make even. Within a section, all tiles are the same size.

#### Scenario: 4-tile section
- **WHEN** a section has 4 tiles
- **THEN** tiles are arranged as 2×2 grid (1 2 / 3 4)

#### Scenario: 3-tile section
- **WHEN** a section has 3 tiles
- **THEN** tiles are rendered as 3 + 1 placeholder; layout shows 4 tiles total

#### Scenario: Tile content alignment
- **WHEN** each tile has text content
- **THEN** text is centered inside the tile

### Requirement: imageTiles have background image with text overlay
When a tile's content is an object (not plain text) in contentType="imageTiles", the tile displays a background image with text overlay. The overlay has a gradient from a specified color fading to transparent, directed opposite to textOrientation.

#### Scenario: Image tile with text
- **WHEN** a tile has `image: "./img/character.png"` and `title: "Peter Gregory"` with `textOrientation: "bottom-center"`
- **THEN** the image fills the tile background, and the title appears in a gradient overlay at the bottom

### Requirement: Each section has a unique scroll-aware hash id
Each section's heading gets a unique id derived from its `title` (kebab-case slug). As the user scrolls, `history.replaceState` updates the URL hash to the currently visible section (not a full page reload).

#### Scenario: Hash link navigation
- **WHEN** a section has `title: "Key Scenes"`
- **THEN** the <h2> has id="key-scenes"; the URL updates to #key-scenes as the section comes into view

#### Scenario: Deep linking
- **WHEN** a user navigates directly to /lesson/1#key-scenes
- **THEN** the page loads and scrolls to the section with that id

### Requirement: Section titles and media have scroll-triggered animations
When a section's title comes into view (any part visible), the title text slides in with eased animation (Sway-style). Media (images, video, canvas) in the section also appear with scale/slide animation on first visibility.

#### Scenario: Title scroll-in
- **WHEN** a user scrolls the page and a section title enters the viewport
- **THEN** the title text (not the background) animates in with a slide and ease

#### Scenario: Media appearance
- **WHEN** video or minigame canvas enters the viewport
- **THEN** it scales and slides into view

### Requirement: Fixed scroll progress bar appears when all content is loaded
Once all content is loaded and page height is known, a fixed progress bar (several px high) appears at the top. It fills as the user scrolls down the page.

#### Scenario: Progress bar visibility
- **WHEN** the page finishes loading
- **THEN** a thin progress bar appears at the top of the viewport

#### Scenario: Progress tracking
- **WHEN** the user scrolls 50% down the page
- **THEN** the progress bar is 50% filled

### Requirement: Dialogues section parses script.txt and renders by character
A dialogues section renders lines from script.txt (format: `CHARACTER_ID|LINE`). React looks up character metadata from a Characters section (type="text", contentType="imageTiles") in the same config and applies color and name.

#### Scenario: Dialogue rendering
- **WHEN** script.txt has "peter|Hello, folks!" and a character with id="peter" exists
- **THEN** the dialogues section renders the line with Peter's color and name: "**Peter:** Hello, folks!"

#### Scenario: Character lookup
- **WHEN** a character id in script.txt does not match any tile id in the Characters section
- **THEN** the dialogue still renders with the id as a fallback name

### Requirement: Dialogues section has no title; it is exempt from hash-id and scroll-in animation
The dialogues section does not render a section title (title field is ignored). It is exempt from hash-id slugification and title scroll-in animation.

#### Scenario: Dialogues in layout
- **WHEN** a dialogues section is rendered
- **THEN** no <h2> is shown; the section starts with dialogue lines

### Requirement: Playlist section renders video player and sidebar
A playlist section renders two columns: 75% video block, 25% playlist sidebar. The video player is a container div; the vanilla player module creates the video element and nav bar inside. The sidebar lists playlist items with title, subtitle, and highlighting of the currently playing item.

#### Scenario: Playlist layout
- **WHEN** a playlist section is rendered
- **THEN** left side shows video + nav bar; right side shows playlist items

#### Scenario: Playlist item click
- **WHEN** user clicks a playlist item
- **THEN** that video starts playing from the beginning; volume persists

### Requirement: clipslesson section renders navigation, volume, video, and term overlay
A clipslesson section renders a control bar (nav buttons, pause, volume) at the top, the video player below, and a term overlay on the right when a term is active. React loads terms.json and computes active sequence/term by currentTime.

#### Scenario: clipslesson layout
- **WHEN** a clipslesson section loads
- **THEN** nav bar at top with prev/next/pause/volume; video player below; term card on right when term is active

#### Scenario: Term navigation
- **WHEN** user clicks next
- **THEN** video plays the next sequence; when it ends, the first term is shown

#### Scenario: Pause state
- **WHEN** user clicks pause
- **THEN** video pauses; pause button is disabled in term display mode

### Requirement: Minigame section renders a container for the vanilla module
A minigame section renders only a div container. The vanilla minigame module creates a canvas inside it. React does NOT render the minigame UI or game logic.

#### Scenario: Minigame container
- **WHEN** a minigame section is rendered
- **THEN** React renders a div; the minigame module creates its canvas inside and initializes

### Requirement: Embeddable modules use React wrappers with loading and error states
React wrapper components for embeddable modules (video player, minigame) display a loader while init() is in progress and error UI if init() fails. They call destroy() on unmount.

#### Scenario: Module loading
- **WHEN** an embeddable module wrapper mounts
- **THEN** a spinner/loader is shown until init() resolves

#### Scenario: Module error
- **WHEN** module init() rejects
- **THEN** error UI is shown with a message; React does not crash

### Requirement: Page ends with "That's all, folks!" message
After the final section, React renders a closing message: "That's all, folks!" in a playful but not over-the-top style.

#### Scenario: Page closure
- **WHEN** the user scrolls to the bottom of a lesson page
- **THEN** "That's all, folks!" appears after the last section

### Requirement: Placeholder UI for modules during development
When a module (video player or minigame) does not yet exist, the section renders a simple placeholder box (same dimensions as the real module would have) with a "Module loading..." message.

#### Scenario: Playlist placeholder
- **WHEN** the video player module is not yet implemented
- **THEN** a rectangular placeholder box appears in the playlist section

#### Scenario: Minigame placeholder
- **WHEN** the minigame module is not yet implemented
- **THEN** a square placeholder canvas appears in the minigame section

### Requirement: Media assets (video, audio, images) are preloaded in background
Upon lesson page load, React SHALL begin background preloading of all media assets referenced in the config (video files, audio files, images). Preloading occurs immediately and runs in parallel; it does NOT block page rendering or section display. Visual media appears with scroll-triggered animations as the user scrolls to it, but the underlying asset is already cached.

#### Scenario: Video preload
- **WHEN** a lesson loads and config references ./video/episode.mp4 in a playlist section far below the fold
- **THEN** the video begins preloading immediately in the background; the page is interactive and renders normally; when the user scrolls to the playlist section, the video is already cached

#### Scenario: Image preload
- **WHEN** config.json has section images with src paths
- **THEN** all images start preloading on page load; they display with scroll-triggered animation when visible

#### Scenario: Audio preload
- **WHEN** a minigame or clipslesson section references audio in config (e.g., coin flip sound)
- **THEN** audio preloads on page load; sound is ready when the user interacts with the module

#### Scenario: Preload does not block rendering
- **WHEN** a page has 5 sections with heavy media (multiple videos and images)
- **THEN** the page renders all sections immediately; preloading happens silently in the background without delays
