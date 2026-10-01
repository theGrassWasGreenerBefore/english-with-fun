import type { ReactNode } from "react";
import type { ImageOrientation } from "../../types/config";
import styles from "./Section.module.css";

const ORIENTATION_CLASS: Record<ImageOrientation, string> = {
  left: styles.orientationLeft,
  right: styles.orientationRight,
  top: styles.orientationTop,
  bottom: styles.orientationBottom,
};

interface SectionLayoutProps {
  readonly id?: string;
  readonly orientation?: ImageOrientation;
  readonly image?: ReactNode;
  readonly children: ReactNode;
}

function SectionLayout({ id, orientation = "left", image, children }: SectionLayoutProps) {
  if (!image) {
    return (
      <section id={id} className={styles.section}>
        <div className={styles.sectionInner}>{children}</div>
      </section>
    );
  }

  return (
    <section id={id} className={styles.section}>
      <div className={`${styles.sectionInner} ${styles.sectionLayout} ${ORIENTATION_CLASS[orientation]}`}>
        <div className={styles.sectionImageWrap}>{image}</div>
        <div className={styles.sectionContent}>{children}</div>
      </div>
    </section>
  );
}

export default SectionLayout;
