import { useSectionReveal } from "../../hooks/useSectionReveal";
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
  const id = slugify(section.title);
  const { ref, revealed } = useSectionReveal(id);

  return (
    <header
      id={id}
      className={styles.header}
      style={{ backgroundImage: `url(${backgroundUrl})` }}
    >
      <div className={styles.headerOverlay} style={{ fontSize: section.fontSize }} ref={ref}>
        <div className={`${styles.headerTitleWrap} ${revealed ? styles.revealed : ""}`}>
          <span className={styles.headerTitleBg} aria-hidden="true" />
          <h1 className={styles.headerTitle}>{section.title}</h1>
        </div>
        <div className={`${styles.headerSubtitleWrap} ${revealed ? styles.revealed : ""}`}>
          <span className={styles.headerSubtitleBg} aria-hidden="true" />
          <p className={styles.headerSubtitle}>{section.subtitle}</p>
        </div>
      </div>
    </header>
  );
}

export default HeaderSection;
