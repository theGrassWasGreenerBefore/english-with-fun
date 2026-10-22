# Spec Delta

## Purpose

Defines the WebGL coin-flip minigame module, a vanilla JavaScript/TypeScript embeddable module that renders an interactive 3D coin animation with physics, texture mapping, and audio synchronization.

## ADDED Requirements

### Requirement: Minigame is an embeddable vanilla WebGL module
The minigame implements the embeddable interface: `init(container, config)` and `destroy()`. It is written in vanilla TypeScript with WebGL 2.0 and GLSL ES 3.00. It does NOT import React.

#### Scenario: Module initialization
- **WHEN** React calls minigame.init(container, config)
- **THEN** the minigame creates a canvas, initializes WebGL context, compiles shaders, loads texture and audio, and resolves when fully ready

#### Scenario: Module cleanup
- **WHEN** React calls minigame.destroy()
- **THEN** all WebGL buffers, shaders, textures, audio, listeners, and animation frames are freed; the same instance can be re-initialized

### Requirement: Coin game is a top-down 3D flip animation
The game renders a coin in top-down view. When the player clicks, the coin flips with animation: it ascends (growing, flipping rapidly), peaks and begins descending, lands, and vibrates to a stop. The coin shows heads, tails, or edge based on rotation.

#### Scenario: Initial state
- **WHEN** the game initializes
- **THEN** a coin is visible, centered, with a random initial side (heads or tails); cursor is pointer; the area is clickable

#### Scenario: Coin flip animation
- **WHEN** the player clicks the coin
- **THEN** the coin ascends (growing in size, flipping rapidly), reaches peak mid-flight, descends back, and vibrates on landing; the final side (heads or tails) is determined by the number of rotations

#### Scenario: Return to ready state
- **WHEN** the vibration animation completes
- **THEN** the coin returns to `still` state, ready for the next click

### Requirement: Minigame has three animation states
The coin has these states:
- `still`: Awaiting user interaction; cursor is pointer; clickable.
- `pending`: Animation in progress (ascending, descending, settling).
  - `ascending`: Coin moving up and flipping rapidly.
  - `descending`: Coin moving down after peak, still flipping.
  - `settling`: Coin landed, vibrating but not flipping.
- Return to `still` when vibration stops.

#### Scenario: State transitions
- **WHEN** the game starts, it is in `still` state
- **THEN** on click, state changes to `pending`/`ascending`; after landing, to `settling`; after vibration stops, back to `still`

### Requirement: Animation is driven by audio timecodes
The game config has a `chrono` object with animation timecodes synced to audio:
- `throw`: Moment coin is released (start of ascending).
- `land`: Moment coin touches the table (start of descending).
- `vibration_stop`: Moment vibration animation ends.

The minigame synchronizes animation with audio playback using these timecodes.

#### Scenario: Audio-synced animation
- **WHEN** audio is playing and time reaches the `throw` timecode
- **THEN** the coin starts ascending animation
- **WHEN** time reaches `land`
- **THEN** the coin starts descending
- **WHEN** time reaches `vibration_stop`
- **THEN** vibration stops and the coin returns to `still`

### Requirement: Texture coordinates map heads, tails, and edge
The gameConfig.json has a `coordinates` object with named regions:
- `heads`: Coordinates for the heads side of the coin (no width/height: center x,y with radius).
- `tails`: Coordinates for the tails side (no width/height: center x,y with radius).
- `edge`: Coordinates for the coin edge when it is perpendicular (explicit x, y, width, height).

The `radius` field defines the coin size. Texture coordinates are used to crop the sprite and display the correct side.

#### Scenario: Texture mapping
- **WHEN** the coin is heads up
- **THEN** the heads region of the sprite is rendered
- **WHEN** the coin is mid-flip
- **THEN** the edge region is rendered
- **WHEN** the coin is tails up
- **THEN** the tails region is rendered

### Requirement: Coin rotation and orientation are synchronized
As the coin flips, rotation angle and skew are calculated per frame to show:
- heads/tails facing up (no edge visible, skew = 0)
- edge visible (perpendicular orientation, skew = 1 or -1)

Rotation phase is continuous and smooth.

#### Scenario: Rotation phase during flip
- **WHEN** the coin is ascending and flipping
- **THEN** rotation angle increases linearly; skew oscillates between -1 and 1 to show edge visibility
- **WHEN** the coin descends
- **THEN** rotation continues; final side is determined by total rotations (base 5 + random 0 or 1)

### Requirement: Coin ascends, peaks, and descends with physics
During animation:
- **Ascending**: Coin moves upward (Y increases) and grows in size from 1x to 2x. Apex is reached at the midpoint between `throw` and `land` times.
- **Descending**: Coin moves downward (Y decreases) and shrinks back to 1x. Shadow beneath grows blurrier during ascent, then clarifies on descent.
- **Settling**: Coin is at Y = 0, size = 1x. Vibration causes small position/rotation oscillations that decay over time.

#### Scenario: Height and size during animation
- **WHEN** time is between throw and apex
- **THEN** coin Y position increases and size grows to 2x
- **WHEN** time is between apex and land
- **THEN** coin Y decreases and size shrinks to 1x
- **WHEN** time is between land and vibration_stop
- **THEN** coin position and rotation oscillate with decay; size stays 1x

### Requirement: Final side is determined by rotation count
Before animation starts, the minigame calculates:
- Base rotations: 5 (constant)
- Random addition: 0 or 1 (randomized each flip)
- Total rotations during animation determines final side (heads or tails)

#### Scenario: Rotation count determines side
- **WHEN** total rotations = odd number
- **THEN** final side is opposite the initial side
- **WHEN** total rotations = even number
- **THEN** final side is same as initial side

### Requirement: Blurred shadow layer under the coin
The game renders a shadow beneath the coin that blurs more during flight and clarifies as the coin lands. The shadow is a pseudo-3D depth cue.

#### Scenario: Shadow during flight
- **WHEN** the coin is in mid-air
- **THEN** the shadow blur increases

#### Scenario: Shadow after landing
- **WHEN** the coin is settling on the table
- **THEN** the shadow blur decreases back to normal

### Requirement: WebGL setup and shader compilation
During init(), the minigame:
- Creates a canvas element inside the container.
- Acquires a WebGL 2.0 context (rejects if unsupported).
- Compiles vertex and fragment shaders (GLSL ES 3.00, rejects if compilation fails with useful error).
- Creates geometry buffers and texture sampler for the coin.
- Initializes the first render state and animation frame loop.

#### Scenario: WebGL context acquisition
- **WHEN** init() runs on a WebGL 2.0-capable browser
- **THEN** WebGL context is created; subsequent draw calls use it

#### Scenario: Shader compilation failure
- **WHEN** a shader fails to compile
- **THEN** init() rejects with an error message naming the shader and the compilation error

### Requirement: Texture loading is async and graceful
The game loads a texture from config.texture (a path string). If the texture fails to load, the game initializes anyway and renders fallback geometry (no texture, solid color).

#### Scenario: Texture load success
- **WHEN** config.texture is "./coin-texture.png" and the file exists
- **THEN** the minigame loads it and applies it to the coin

#### Scenario: Texture load failure
- **WHEN** config.texture file does not exist or fails to load
- **THEN** the minigame initializes with a solid-color coin (fallback)

### Requirement: Audio loading is optional and graceful
The game optionally loads audio from config.sound (if present). If audio loading fails, animation still runs but without sound.

#### Scenario: Audio with animation
- **WHEN** config.sound is provided and loads successfully
- **THEN** audio plays; animation timecodes (chrono) are synced to audio playback

#### Scenario: Audio missing
- **WHEN** config.sound is missing or fails to load
- **THEN** animation still plays; timecodes are not used (animation runs based on requestAnimationFrame)

### Requirement: Animation is driven by requestAnimationFrame
The game uses requestAnimationFrame for smooth animation. The frame handle is stored and cancelled in destroy(). Animation runs at the browser's refresh rate (60fps typical, but 24fps is sufficient, 12fps acceptable as fallback).

#### Scenario: Smooth animation
- **WHEN** the coin is flipping
- **THEN** requestAnimationFrame fires ~60 times per second; each frame updates position, rotation, and re-renders

#### Scenario: Cleanup on unmount
- **WHEN** destroy() is called
- **THEN** cancelAnimationFrame() is called with the stored frame handle; no frames fire after destroy()

### Requirement: destroy() is synchronous and robust
destroy() performs:
- Stop animation frame.
- Pause and unload audio.
- Remove all event listeners.
- Delete WebGL buffers, programs, and textures.
- Clear DOM inside the container (or leave container empty).
- Reset all internal references to null.
- Log and suppress any errors (does not throw).

#### Scenario: Full cleanup
- **WHEN** destroy() runs
- **THEN** no WebGL resources, listeners, or animation frames remain alive

#### Scenario: Error suppression
- **WHEN** an error occurs during cleanup (e.g., double-delete of a buffer)
- **THEN** the error is logged to console.error but not thrown; destroy() completes normally

### Requirement: No React imports; no generic plugin system
The minigame does NOT import React. The coin-specific logic is allowed; a generic game registry or plugin system is NOT built.

#### Scenario: Module isolation
- **WHEN** the minigame module is analyzed
- **THEN** no React imports or framework-level abstractions (ECS, plugin registry) appear

### Requirement: Configuration is read from gameConfig.json
All minigame parameters come from config: texture path, sound path, coordinate regions, radius, animation timecodes. Code does NOT hardcode these values.

#### Scenario: Config-driven initialization
- **WHEN** gameConfig.json has custom coordinate regions and timecodes
- **THEN** the minigame uses those values; changing the config changes the game behavior without code modification

### Requirement: Minigame proposes implementation trade-offs to the engineer
During development, the minigame implementation proposes options to the engineer for:
- Pseudo-3D vs. full 3D rendering.
- Sprite animation vs. concurrent layer animations.
- Frame rate (60fps, 24fps, 12fps).

These proposals document the cost of each decision so the engineer can approve or override.

#### Scenario: Implementation proposal
- **WHEN** the minigame is developed
- **THEN** key trade-off decisions are documented with pros/cons for engineer review
