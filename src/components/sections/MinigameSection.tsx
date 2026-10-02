import type { MinigameSection as MinigameSectionData } from "../../types/config";
import { resolveAssetPath } from "../../utils/resolveAssetPath";
import SectionLayout from "./SectionLayout";
import styles from "./Section.module.css";

interface MinigameSectionProps {
  readonly section: MinigameSectionData;
  readonly basePath: string;
}

// WebGL minigame internals are implemented by /skill-minigame; this is layout only.
function MinigameSection({ section, basePath }: MinigameSectionProps) {
  const image = section.image ? (
    <img
      src={resolveAssetPath(basePath, section.image)}
      alt=""
      className={styles.sectionImage}
      style={{ width: section.imageWidth, height: section.imageHeight }}
    />
  ) : undefined;

  return (
    <SectionLayout orientation={section.imageOrientation} image={image} fontSize={section.fontSize}>
      <div className={styles.placeholderBox}>Minigame placeholder ({section.gameType})</div>
    </SectionLayout>
  );
}

export default MinigameSection;
