// Locates the "Characters" imageTiles section in config.json and returns its tiles,
// used by dialogues to map CHARACTER_ID -> display name/color (see AGENTS.md section 5).
import type { LessonConfig } from "../types/config";
import type { Character } from "../types/script";

export function findCharacterTiles(config: LessonConfig): readonly Character[] {
  const section = config.find((s) => s.type === "text" && s.contentType === "imageTiles" && s.title === "Characters");
  return section && section.type === "text" && section.contentType === "imageTiles" ? section.tiles : [];
}
