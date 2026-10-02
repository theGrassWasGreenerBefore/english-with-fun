import type { DialoguesSection as DialoguesSectionData } from "../../types/config";
import styles from "./Section.module.css";

interface DialoguesSectionProps {
  readonly section: DialoguesSectionData;
}

// script.txt parsing and character lookup are a separate task; this is layout only.
function DialoguesSection({ section }: DialoguesSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionInner} style={{ fontSize: section.fontSize }}>
        <div className={styles.placeholderBox}>Dialogues placeholder ({section.lines})</div>
      </div>
    </section>
  );
}

export default DialoguesSection;
