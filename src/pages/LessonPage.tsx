import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ScrollProgressBar from "../components/ScrollProgressBar";
import SectionRenderer from "../components/SectionRenderer";
import type { LessonConfig } from "../types/config";
import { findCharacterTiles } from "../utils/findCharacterTiles";
import styles from "./LessonPage.module.css";

const DEFAULT_LESSON_ID = "lesson_1";

function LessonPage() {
  const params = useParams();
  const lessonId = params.id ?? DEFAULT_LESSON_ID;
  const basePath = `${import.meta.env.BASE_URL}assets/${lessonId}/`;

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

  const characters = findCharacterTiles(config);

  return (
    <LessonContent config={config} basePath={basePath} characters={characters} />
  );
}

function LessonContent({
  config,
  basePath,
  characters,
}: {
  config: LessonConfig;
  basePath: string;
  characters: ReturnType<typeof findCharacterTiles>;
}) {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <ScrollProgressBar />
      <main className={styles.lessonPage}>
        {config.map((section, index) => (
          <SectionRenderer
            key={`${section.type}-${index}`}
            section={section}
            basePath={basePath}
            characters={characters}
          />
        ))}
      </main>
    </>
  );
}

export default LessonPage;
