import { useSectionReveal } from "../../hooks/useSectionReveal";
import type { PlaylistSection as PlaylistSectionData } from "../../types/config";
import { slugify } from "../../utils/slugify";
import styles from "./Section.module.css";
import SectionTitle from "./SectionTitle";

interface PlaylistSectionProps {
  readonly section: PlaylistSectionData;
}

// Playlist module is implemented by /skill-video-player; this is layout only.
function PlaylistSection({ section }: PlaylistSectionProps) {
  const id = slugify(section.title);
  const { ref, revealed } = useSectionReveal(id);

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner} style={{ fontSize: section.fontSize }} ref={ref}>
        <SectionTitle id={id} revealed={revealed}>
          {section.title}
        </SectionTitle>
        <div className={styles.placeholderBox}>Playlist placeholder</div>
      </div>
    </section>
  );
}

export default PlaylistSection;
