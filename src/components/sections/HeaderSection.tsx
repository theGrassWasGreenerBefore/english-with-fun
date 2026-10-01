import type { HeaderSection as HeaderSectionData } from "../../types/config";
import { resolveAssetPath } from "../../utils/resolveAssetPath";
import { slugify } from "../../utils/slugify";
import styles from "./Section.module.css";

interface HeaderSectionProps {
  readonly section: HeaderSectionData;
  readonly basePath: string;
}

function HeaderSection({ section, basePath }: HeaderSectionProps) {
  const backgroundUrl = resolveAssetPath(basePath, section.background);

  return (
    <header
      id={slugify(section.title)}
      className={styles.header}
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className={styles.headerOverlay}>
        <h1 className={styles.headerTitle}>{section.title}</h1>
        <p className={styles.headerSubtitle}>{section.subtitle}</p>
      </div>
    </header>
  );
}

export default HeaderSection;
