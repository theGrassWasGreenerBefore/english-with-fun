import { useEffect, useState } from "react";
import { useParams } from "react-router";
import SectionRenderer from "../components/SectionRenderer";
import type { LessonConfig } from "../types/config";
import styles from "./LessonPage.module.css";

const DEFAULT_LESSON_ID = "lesson_1";

function LessonPage() {
  const params = useParams();
  const lessonId = params.id ?? DEFAULT_LESSON_ID;
  const basePath = `/assets/${lessonId}/`;

  const [config, setConfig] = useState<LessonConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setConfig(null);
    setError(null);

    fetch(`${basePath}config.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load lesson config: ${response.status}`);
        }
        return response.json() as Promise<LessonConfig>;
      })
      .then((data) => {
        if (!cancelled) setConfig(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      });

    return () => {
      cancelled = true;
    };
  }, [basePath]);

  if (error) {
    return <div className={styles.status}>Failed to load lesson: {error}</div>;
  }

  if (!config) {
    return <div className={styles.status}>Loading lesson…</div>;
  }

  return (
    <main className={styles.lessonPage}>
      {config.map((section, index) => (
        <SectionRenderer key={`${section.type}-${index}`} section={section} basePath={basePath} />
      ))}
    </main>
  );
}

export default LessonPage;
