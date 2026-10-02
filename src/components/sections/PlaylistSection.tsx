import { useEffect, useRef } from "react";
import { useSectionReveal } from "../../hooks/useSectionReveal";
import { PlaylistPlayer } from "../../modules/videoPlayer/PlaylistPlayer";
import type { PlaylistSection as PlaylistSectionData } from "../../types/config";
import { resolveAssetPath } from "../../utils/resolveAssetPath";
import { slugify } from "../../utils/slugify";
import styles from "./Section.module.css";
import SectionTitle from "./SectionTitle";

interface PlaylistSectionProps {
  readonly section: PlaylistSectionData;
  readonly basePath: string;
}

function PlaylistSection({ section, basePath }: PlaylistSectionProps) {
  const id = slugify(section.title);
  const { ref, revealed } = useSectionReveal(id);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const player = new PlaylistPlayer();
    void player.init(container, {
      playlist: section.playlist.map((item) => ({
        ...item,
        src: resolveAssetPath(basePath, item.src),
      })),
    });

    return () => player.destroy();
  }, [basePath, section.playlist]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner} style={{ fontSize: section.fontSize }} ref={ref}>
        <SectionTitle id={id} revealed={revealed}>
          {section.title}
        </SectionTitle>
        <div ref={mountRef} />
      </div>
    </section>
  );
}

export default PlaylistSection;
