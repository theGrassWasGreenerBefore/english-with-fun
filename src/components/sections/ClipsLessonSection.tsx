import type { ClipsLessonSection as ClipsLessonSectionData } from "../../types/config";
import { slugify } from "../../utils/slugify";
import styles from "./Section.module.css";

interface ClipsLessonSectionProps {
  readonly section: ClipsLessonSectionData;
}

// Video module and term overlay are implemented by /skill-video-player; this is layout only.
function ClipsLessonSection({ section }: ClipsLessonSectionProps) {
  return (
    <section id={slugify(section.title)} className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>{section.title}</h2>
        <div className={styles.placeholderBox}>Clips lesson player placeholder</div>
      </div>
    </section>
  );
}

export default ClipsLessonSection;
