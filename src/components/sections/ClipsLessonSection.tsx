import { useSectionReveal } from "../../hooks/useSectionReveal";
import type { ClipsLessonSection as ClipsLessonSectionData } from "../../types/config";
import { slugify } from "../../utils/slugify";
import styles from "./Section.module.css";
import SectionTitle from "./SectionTitle";

interface ClipsLessonSectionProps {
  readonly section: ClipsLessonSectionData;
}

// Video module and term overlay are implemented by /skill-video-player; this is layout only.
function ClipsLessonSection({ section }: ClipsLessonSectionProps) {
  const id = slugify(section.title);
  const { ref, revealed } = useSectionReveal(id);

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner} style={{ fontSize: section.fontSize }} ref={ref}>
        <SectionTitle id={id} revealed={revealed}>
          {section.title}
        </SectionTitle>
        <div className={styles.placeholderBox}>Clips lesson player placeholder</div>
      </div>
    </section>
  );
}

export default ClipsLessonSection;
