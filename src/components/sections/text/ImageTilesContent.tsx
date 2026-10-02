import { useSectionReveal } from "../../../hooks/useSectionReveal";
import type { ImageTilesSection, Tile } from "../../../types/config";
import { resolveAssetPath } from "../../../utils/resolveAssetPath";
import { slugify } from "../../../utils/slugify";
import styles from "../Section.module.css";
import SectionTitle from "../SectionTitle";

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

// Opaque color near the text, fading to transparent toward the opposite side/corner
// from textOrientation, so the image stays visible away from the readable text.
function overlayGradient(color: string, textOrientation: string): string {
  const [horizontal, vertical] = textOrientation.split("-");
  const horizontalOpposite = horizontal === "left" ? "right" : horizontal === "right" ? "left" : "";
  const verticalOpposite = vertical === "top" ? "bottom" : vertical === "bottom" ? "top" : "";
  const direction = [verticalOpposite, horizontalOpposite].filter(Boolean).join(" ");
  const opaque = `${color}cc`;
  const transparent = `${color}00`;
  return direction
    ? `linear-gradient(to ${direction}, ${opaque}, ${transparent})`
    : `radial-gradient(circle, ${opaque}, ${transparent})`;
}

function ImageTilesContent({ section, basePath }: ImageTilesContentProps) {
  const id = slugify(section.title);
  const { ref, revealed } = useSectionReveal(id);
  const tiles: readonly (Tile | null)[] =
    section.tiles.length % 2 !== 0 ? [...section.tiles, null] : section.tiles;
  const gridClass = tiles.length === 4 ? `${styles.imageTilesGrid} ${styles.squareBlock}` : styles.imageTilesGrid;

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner} style={{ fontSize: section.fontSize }} ref={ref}>
        <SectionTitle id={id} revealed={revealed}>
          {section.title}
        </SectionTitle>
        <div className={gridClass}>
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
                  style={{ background: overlayGradient(tile.color, tile.textOrientation), color: readableTextColor(tile.color) }}
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
