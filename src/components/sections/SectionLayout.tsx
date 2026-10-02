import type { ReactNode } from "react";
import { useSectionReveal } from "../../hooks/useSectionReveal";
import type { ImageOrientation } from "../../types/config";
import styles from "./Section.module.css";
import SectionTitle from "./SectionTitle";

const ORIENTATION_CLASS: Record<ImageOrientation, string> = {
  left: styles.orientationLeft,
  right: styles.orientationRight,
  top: styles.orientationTop,
  bottom: styles.orientationBottom,
};

interface SectionLayoutProps {
  readonly id?: string;
  readonly title?: ReactNode;
  readonly orientation?: ImageOrientation;
  readonly image?: ReactNode;
  readonly fontSize?: string;
  readonly children: ReactNode;
}

function SectionLayout({ id, title, orientation = "left", image, fontSize, children }: SectionLayoutProps) {
  const { ref, revealed } = useSectionReveal(id);
  const titleEl = title ? (
    <SectionTitle id={id} revealed={revealed}>
      {title}
    </SectionTitle>
  ) : null;

  if (!image) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionInner} style={{ fontSize }} ref={ref}>
          {titleEl}
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner} style={{ fontSize }} ref={ref}>
        {titleEl}
        <div className={`${styles.sectionLayout} ${ORIENTATION_CLASS[orientation]}`}>
          <div className={`${styles.sectionImageWrap} ${revealed ? styles.revealed : ""}`}>{image}</div>
          <div className={styles.sectionContent}>{children}</div>
        </div>
      </div>
    </section>
  );
}

export default SectionLayout;
