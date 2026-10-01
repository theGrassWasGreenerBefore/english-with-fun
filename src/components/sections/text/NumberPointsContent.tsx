import type { NumberPointsSection } from "../../../types/config";
import { resolveAssetPath } from "../../../utils/resolveAssetPath";
import { slugify } from "../../../utils/slugify";
import SectionLayout from "../SectionLayout";
import styles from "../Section.module.css";

interface NumberPointsContentProps {
  readonly section: NumberPointsSection;
  readonly basePath: string;
}

function NumberPointsContent({ section, basePath }: NumberPointsContentProps) {
  const image = section.image ? (
    <img src={resolveAssetPath(basePath, section.image)} alt={section.title} className={styles.sectionImage} />
  ) : undefined;

  return (
    <SectionLayout id={slugify(section.title)} orientation={section.imageOrientation} image={image}>
      <h2 className={styles.sectionTitle}>{section.title}</h2>
      {section.subTitle && <p className={styles.subTitle}>{section.subTitle}</p>}
      <ol className={styles.numberList}>
        {section.numberPoints.map((point, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
        ))}
      </ol>
    </SectionLayout>
  );
}

export default NumberPointsContent;
