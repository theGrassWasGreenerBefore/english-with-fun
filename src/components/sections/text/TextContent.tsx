import type { TextContentSection } from "../../../types/config";
import { resolveAssetPath } from "../../../utils/resolveAssetPath";
import { slugify } from "../../../utils/slugify";
import SectionLayout from "../SectionLayout";
import styles from "../Section.module.css";

interface TextContentProps {
  readonly section: TextContentSection;
  readonly basePath: string;
}

function TextContent({ section, basePath }: TextContentProps) {
  const images = section.images ?? (section.image ? [section.image] : []);
  const image =
    images.length > 0 ? (
      <div className={styles.imageStack}>
        {images.map((src) => (
          <img
            key={src}
            src={resolveAssetPath(basePath, src)}
            alt={section.title}
            className={styles.sectionImage}
            style={{ width: section.imageWidth, height: section.imageHeight }}
          />
        ))}
      </div>
    ) : undefined;

  return (
    <SectionLayout
      id={slugify(section.title)}
      title={section.title}
      orientation={section.imageOrientation}
      image={image}
      fontSize={section.fontSize}
    >
      <div className={styles.sectionText} dangerouslySetInnerHTML={{ __html: section.text }} />
    </SectionLayout>
  );
}

export default TextContent;
