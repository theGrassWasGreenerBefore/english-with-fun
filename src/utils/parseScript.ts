// Parses script.txt ("CHARACTER_ID|text" per line) into ScriptLine entries.
import type { ScriptLine } from "../types/script";

export function parseScriptLines(raw: string): ScriptLine[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf("|");
      if (separatorIndex === -1) {
        return { characterId: line, text: "" };
      }
      return {
        characterId: line.slice(0, separatorIndex),
        text: line.slice(separatorIndex + 1),
      };
    });
}
