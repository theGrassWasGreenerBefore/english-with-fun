import type { ImageTilesSection, Tile } from "../../../types/config";
import { resolveAssetPath } from "../../../utils/resolveAssetPath";
import { slugify } from "../../../utils/slugify";
import styles from "../Section.module.css";

interface ImageTilesContentProps {
  readonly section: ImageTilesSection;
  readonly basePath: string;
}

const HORIZONTAL_CLASS: Record<string, string> = {
  left: styles.alignLeft,
  center: styles.alignCenterH,
  right: styles.alignRight,
};

const VERTICAL_CLASS: Record<string, string> = {
  top: styles.alignTop,
  center: styles.alignCenterV,
  bottom: styles.alignBottom,
};

function textOrientationClasses(textOrientation: string): string {
  const [horizontal, vertical] = textOrientation.split("-");
  return `${HORIZONTAL_CLASS[horizontal] ?? ""} ${VERTICAL_CLASS[vertical] ?? ""}`.trim();
}

// Simple relative-luminance check to keep overlay text readable against the tile color.
function readableTextColor(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1a1a1a" : "#f5f5f5";
}

function ImageTilesContent({ section, basePath }: ImageTilesContentProps) {
  const tiles: readonly (Tile | null)[] =
    section.tiles.length % 2 !== 0 ? [...section.tiles, null] : section.tiles;

  return (
    <section id={slugify(section.title)} className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>{section.title}</h2>
        <div className={styles.imageTilesGrid}>
          {tiles.map((tile, index) =>
            tile === null ? (
              <div key={`placeholder-${index}`} className={`${styles.imageTile} ${styles.tilePlaceholder}`} aria-hidden="true" />
            ) : (
              <div
                key={tile.id}
                className={styles.imageTile}
                style={{ backgroundImage: `url(${resolveAssetPath(basePath, tile.image)})` }}
              >
                <div
                  className={`${styles.imageTileOverlay} ${textOrientationClasses(tile.textOrientation)}`}
                  style={{ backgroundColor: `${tile.color}cc`, color: readableTextColor(tile.color) }}
                >
                  <p className={styles.imageTileTitle}>{tile.title}</p>
                  <p className={styles.imageTileSubtitle}>{tile.subTitle}</p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default ImageTilesContent;
