import type { ReactNode } from "react";
import styles from "./Section.module.css";

interface SectionTitleProps {
  readonly id?: string;
  readonly revealed: boolean;
  readonly children: ReactNode;
}

function SectionTitle({ id, revealed, children }: SectionTitleProps) {
  return (
    <div className={`${styles.sectionTitleWrap} ${revealed ? styles.revealed : ""}`}>
      <span className={styles.sectionTitleBg} aria-hidden="true" />
      <h2 id={id} className={styles.sectionTitle}>
        {children}
      </h2>
    </div>
  );
}

export default SectionTitle;
