import type { BulletPointsSection } from "../../../types/config";
import { resolveAssetPath } from "../../../utils/resolveAssetPath";
import { slugify } from "../../../utils/slugify";
import SectionLayout from "../SectionLayout";
import styles from "../Section.module.css";

interface BulletPointsContentProps {
  readonly section: BulletPointsSection;
  readonly basePath: string;
}

function BulletPointsContent({ section, basePath }: BulletPointsContentProps) {
  const image = section.image ? (
    <img
      src={resolveAssetPath(basePath, section.image)}
      alt={section.title}
      className={styles.sectionImage}
      style={{ width: section.imageWidth, height: section.imageHeight }}
    />
  ) : undefined;

  return (
    <SectionLayout
      id={slugify(section.title)}
      title={section.title}
      orientation={section.imageOrientation}
      image={image}
      fontSize={section.fontSize}
    >
      {section.subTitle && <p className={styles.subTitle}>{section.subTitle}</p>}
      <ul className={styles.bulletList}>
        {section.bulletPoints.map((point, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
        ))}
      </ul>
    </SectionLayout>
  );
}

export default BulletPointsContent;
