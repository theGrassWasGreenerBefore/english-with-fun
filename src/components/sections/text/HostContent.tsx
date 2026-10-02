import type { HostSection } from "../../../types/config";
import { resolveAssetPath } from "../../../utils/resolveAssetPath";
import SectionLayout from "../SectionLayout";
import styles from "../Section.module.css";

interface HostContentProps {
  readonly section: HostSection;
  readonly basePath: string;
}

function HostContent({ section, basePath }: HostContentProps) {
  const image = section.image ? (
    <img
      src={resolveAssetPath(basePath, section.image)}
      alt={section.name}
      className={styles.hostAvatar}
      style={{ width: section.imageWidth, height: section.imageHeight }}
    />
  ) : undefined;

  return (
    <SectionLayout orientation={section.imageOrientation} image={image} fontSize={section.fontSize}>
      <div className={styles.hostCard}>
        <div className={styles.hostInfo}>
          <p className={styles.hostName}>{section.name}</p>
          <p className={styles.hostJobTitle}>{section.jobTitle}</p>
          <p className={styles.hostLocation}>{section.location}</p>
        </div>
      </div>
    </SectionLayout>
  );
}

export default HostContent;
