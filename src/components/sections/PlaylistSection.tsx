import type { PlaylistSection as PlaylistSectionData } from "../../types/config";
import { slugify } from "../../utils/slugify";
import styles from "./Section.module.css";

interface PlaylistSectionProps {
  readonly section: PlaylistSectionData;
}

function PlaylistSection({ section }: PlaylistSectionProps) {
  return (
    <section id={slugify(section.title)} className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionTitle}>{section.title}</h2>
        <div className={styles.playlist}>
          {section.playlist.map((item) => (
            <div key={item.src} className={styles.playlistItem}>
              <p className={styles.playlistItemTitle}>{item.title}</p>
              <p className={styles.playlistItemSubtitle}>{item.subtitle}</p>
              <div className={styles.videoPlaceholder}>Video player placeholder</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PlaylistSection;
