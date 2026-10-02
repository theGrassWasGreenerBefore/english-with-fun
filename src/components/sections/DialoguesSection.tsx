import { useEffect, useState } from "react";
import type { DialoguesSection as DialoguesSectionData } from "../../types/config";
import type { Character, ScriptLine } from "../../types/script";
import { parseScriptLines } from "../../utils/parseScript";
import { resolveAssetPath } from "../../utils/resolveAssetPath";
import styles from "./Section.module.css";

interface DialoguesSectionProps {
  readonly section: DialoguesSectionData;
  readonly basePath: string;
  readonly characters: readonly Character[];
}

function firstName(character: Character): string {
  return character.title.split(" ")[0];
}

function DialoguesSection({ section, basePath, characters }: DialoguesSectionProps) {
  const [lines, setLines] = useState<readonly ScriptLine[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLines(null);
    setError(null);

    fetch(resolveAssetPath(basePath, section.lines))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load dialogue lines: ${response.status}`);
        }
        return response.text();
      })
      .then((raw) => {
        if (!cancelled) setLines(parseScriptLines(raw));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      });

    return () => {
      cancelled = true;
    };
  }, [basePath, section.lines]);

  const charactersById = new Map(characters.map((character) => [character.id, character]));

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner} style={{ fontSize: section.fontSize }}>
        {error && <p className={styles.sectionText}>Failed to load dialogue: {error}</p>}
        {!error && !lines && <p className={styles.sectionText}>Loading dialogue…</p>}
        {lines && (
          <div className={styles.dialogueList}>
            {lines.map((line, index) => {
              const character = charactersById.get(line.characterId);
              return (
                <div key={index} className={styles.dialogueLine} style={{ color: character?.color }}>
                  <strong>{character ? firstName(character) : line.characterId}:</strong> {line.text}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default DialoguesSection;
