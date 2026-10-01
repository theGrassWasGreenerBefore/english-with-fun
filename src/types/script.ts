// Shapes for script.txt ("CHARACTER_ID|text" lines) and the character it refers to.
// See AGENTS.md section 5.
import type { Tile } from "./config";

export interface ScriptLine {
  readonly characterId: string;
  readonly text: string;
}

// A character is the same shape as a Tile from the "characterTiles" section
// (type: "text", contentType: "characterTiles", title: "Characters"),
// matched by CHARACTER_ID <-> tiles[].id.
export type Character = Tile;
