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
    <img src={resolveAssetPath(basePath, section.image)} alt={section.title} className={styles.sectionImage} />
  ) : undefined;

  return (
    <SectionLayout id={slugify(section.title)} orientation={section.imageOrientation} image={image}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
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
