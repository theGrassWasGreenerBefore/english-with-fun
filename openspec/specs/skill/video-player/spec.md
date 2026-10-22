# skill/video-player Specification

## Purpose
Defines the vanilla JavaScript video player module, its two modes (playlist and headless clipslesson), the public API, event emission, and lifecycle management.

## Requirements

### Requirement: Video player is an embeddable vanilla module
The video player is a vanilla JavaScript module (no React) that implements the embeddable interface: `init(container, config)` and `destroy()`. It works in two modes: simple playlist and headless clipslesson.

#### Scenario: Module initialization
- **WHEN** React calls player.init(container, config)
- **THEN** the player creates a <video> element inside container, sets up listeners, and resolves the Promise when ready

#### Scenario: Module cleanup
- **WHEN** React calls player.destroy()
- **THEN** all listeners, DOM, and media are cleaned up; the same instance can be re-initialized

### Requirement: Playlist mode renders video with controls and sidebar navigation
In playlist mode, the player creates:
- A video element with nav bar (prev, play/pause, next, fullscreen, volume, progress bar, time display)
- The video occupies the center; nav bar is at the bottom
- Fullscreen button puts video + nav bar into fullscreen
- Volume defaults to 75%

#### Scenario: Playlist video playback
- **WHEN** a playlist item is clicked
- **THEN** that video plays from the beginning; the item is highlighted in the sidebar

#### Scenario: Video navigation
- **WHEN** user clicks next or prev buttons
- **THEN** video switches to the next/previous item and plays from the start

#### Scenario: Pause/unpause
- **WHEN** user clicks pause
- **THEN** video pauses; clicking again (showing play) unpauses from the same position

#### Scenario: Fullscreen mode
- **WHEN** user clicks fullscreen button
- **THEN** video + nav bar enter fullscreen; user can exit via ESC or fullscreen button

### Requirement: Headless mode (clipslesson) has no UI except video and timebar
In headless mode (clipslesson), the player creates only a <video> element with no visible controls. A thin, non-interactive timebar at the bottom shows sequence progress. React controls playback via API.

#### Scenario: Headless video
- **WHEN** a clipslesson section initializes the player
- **THEN** only a <video> element and timebar are rendered; no pause, play, or volume buttons are visible

#### Scenario: Sequence progress
- **WHEN** a sequence is playing
- **THEN** the timebar fills from the sequence start to end time

### Requirement: Public API methods for playback control
The player exports these methods:
- `play(startTime, stopAtTime?)`: Seek to startTime and play. stopAtTime is optional; if provided, stop when reached.
- `pause()`: Pause the video at current position.
- `unpause()`: Resume from pause.
- `setVolume(percent)`: Set volume (0–100). Clamped to valid range.
- `showStillframe(stillframeTime, framingXOffset)`: Pause, seek to stillframeTime, apply horizontal frame offset (as percentage), and emit `seeked` when ready.

#### Scenario: Play a sequence
- **WHEN** React calls player.play("10.5", "20")
- **THEN** video seeks to 10.5s, plays, and stops when it reaches 20s

#### Scenario: Pause during playback
- **WHEN** React calls player.pause() while video is playing
- **THEN** video pauses; next call to pause() has no effect; must call unpause() to resume

#### Scenario: Volume control
- **WHEN** React calls player.setVolume(50)
- **THEN** video volume is set to 0.5; next call is independent (no delta)

#### Scenario: Stillframe display
- **WHEN** React calls player.showStillframe("5.25", 10)
- **THEN** video pauses, seeks to 5.25s, offsets the image left by 10%, and emits `seeked` when frame is ready

### Requirement: Event emission for state changes and playback events
The player emits events that React and playlist UI listen for:
- `sequenceOver`: Fired when the currently playing sequence reaches its end (stopAtTime or natural video end).
- `seeked`: Fired after showStillframe() has completed seeking and frame is ready.
- `paused`: Fired in response to player.pause() or user clicking video in playing mode.
- `unpaused`: Fired in response to player.unpause() or user clicking video in paused mode.
- `timeupdate`: Fired on video timeupdate (used by React to compute active term).

#### Scenario: Sequence end
- **WHEN** video reaches the stopAtTime passed to play()
- **THEN** video pauses and `sequenceOver` event is emitted

#### Scenario: Still frame ready
- **WHEN** showStillframe() has seeked to the requested time
- **THEN** the video frame is stable and `seeked` event is emitted

#### Scenario: User pause
- **WHEN** user clicks on the video in playlist mode while it is playing
- **THEN** video pauses and `paused` event is emitted

### Requirement: Timecode string parsing
The player accepts timecodes in formats:
- "1:30" (minutes:seconds)
- "1:30.500" (minutes:seconds.milliseconds)

These are parsed and converted to seconds for seek operations.

#### Scenario: Parse timecode
- **WHEN** React calls player.play("1:30.250")
- **THEN** video seeks to 90.25 seconds

#### Scenario: Handle edge case timecodes
- **WHEN** React calls player.play("0:05")
- **THEN** video seeks to 5 seconds

### Requirement: Seeking handles the epsilon case for no-op seeks
When seeking to the current time (within a small epsilon), the video does not actually seek and the native `seeked` event does not fire. The player detects this and emits `seeked` manually to avoid hanging React in showStillframe().

#### Scenario: Seek to current time
- **WHEN** video is already at time 10s and React calls showStillframe("10", ...)
- **THEN** the player detects no real seek is needed, emits `seeked` immediately, and does not wait for native event

### Requirement: Video source is resolved from config-provided path
The config object passed to init() contains a `src` field (for simple mode) or the React wrapper passes it as part of the config. The player resolves this relative to the lesson directory and assigns it to <video>.src.

#### Scenario: Video source assignment
- **WHEN** config.src is "./video/episode1.mp4"
- **THEN** the player assigns the absolute or resolved path to <video>.src

### Requirement: Playlist mode sidebar highlights current item
In playlist mode, the sidebar shows all playlist items. The currently playing item is highlighted. Clicking a different item starts that video.

#### Scenario: Highlight current item
- **WHEN** playlist item 1 is playing
- **THEN** item 1 is highlighted in the sidebar; clicking item 2 starts item 2

#### Scenario: Volume persistence
- **WHEN** user is watching video 1 at 50% volume and clicks video 2
- **THEN** video 2 starts at 50% volume

### Requirement: init() is asynchronous; destroy() is synchronous
init(container, config) returns a Promise that resolves when the player is fully ready (video element created, listeners attached, initial state set). destroy() is synchronous and removes all listeners, stops playback, clears DOM, and resets internal state.

#### Scenario: Init completion
- **WHEN** React awaits player.init(...)
- **THEN** init() resolves only when the player is ready to receive commands

#### Scenario: Re-initialization
- **WHEN** destroy() is called and then init() is called again on the same instance
- **THEN** the player initializes cleanly; internal state is fully reset

### Requirement: Video click toggles pause/unpause (playlist mode only)
In playlist mode, clicking on the video toggles between pause and unpause, emitting the corresponding event. In headless mode, clicks on the video are not handled by the player.

#### Scenario: Click to pause
- **WHEN** video is playing and user clicks on it
- **THEN** video pauses and `paused` event is emitted

#### Scenario: Click to unpause
- **WHEN** video is paused and user clicks on it
- **THEN** video unpauses and `unpaused` event is emitted

### Requirement: No React imports; no terms.json logic
The player does NOT import React. It does NOT read or understand terms.json. It does NOT compute active sequences or terms. It is purely a media playback engine with API and events.

#### Scenario: Player isolation
- **WHEN** the player module is analyzed
- **THEN** no React imports appear; no logic about term sequences or vocabulary exists
