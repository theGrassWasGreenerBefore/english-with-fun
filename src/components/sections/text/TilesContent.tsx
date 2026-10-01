import type { TilesSection } from "../../../types/config";
import { resolveAssetPath } from "../../../utils/resolveAssetPath";
import { slugify } from "../../../utils/slugify";
import SectionLayout from "../SectionLayout";
import styles from "../Section.module.css";

interface TilesContentProps {
  readonly section: TilesSection;
  readonly basePath: string;
}

function TilesContent({ section, basePath }: TilesContentProps) {
  const image = section.image ? (
    <img src={resolveAssetPath(basePath, section.image)} alt={section.title} className={styles.sectionImage} />
  ) : undefined;

  const items: readonly (string | null)[] =
    section.tiles.length % 2 !== 0 ? [...section.tiles, null] : section.tiles;

  return (
    <SectionLayout id={slugify(section.title)} orientation={section.imageOrientation} image={image}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
      <div className={styles.tilesGrid}>
        {items.map((tile, index) =>
          tile === null ? (
            <div key={`placeholder-${index}`} className={`${styles.tile} ${styles.tilePlaceholder}`} aria-hidden="true" />
          ) : (
            <div key={index} className={styles.tile} dangerouslySetInnerHTML={{ __html: tile }} />
          ),
        )}
      </div>
    </SectionLayout>
  );
}

export default TilesContent;
