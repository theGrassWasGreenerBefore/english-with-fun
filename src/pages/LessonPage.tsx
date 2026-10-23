import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ScrollProgressBar from "../components/ScrollProgressBar";
import SectionRenderer from "../components/SectionRenderer";
import type { CoinGameConfig } from "../types/coinGame";
import type { LessonConfig } from "../types/config";
import { collectAssetPaths } from "../utils/collectAssetPaths";
import { findCharacterTiles } from "../utils/findCharacterTiles";
import { preloadAssets, preloadAudio, preloadImage } from "../utils/preloadAssets";
import { resolveAssetPath } from "../utils/resolveAssetPath";
import styles from "./LessonPage.module.css";

const DEFAULT_LESSON_ID = "lesson_1";

// Kicks off background preloading as soon as config.json is parsed; runs in
// parallel with rendering and never blocks it or throws on missing media
// (see skill/layout "Media assets are preloaded in background").
function preloadLessonMedia(config: LessonConfig, basePath: string): void {
  const { images, videos } = collectAssetPaths(config);
  preloadAssets(
    images.map((path) => resolveAssetPath(basePath, path)),
    videos.map((path) => resolveAssetPath(basePath, path)),
  );

  for (const section of config) {
    if (section.type !== "minigame") continue;
    const gameBasePath = `${import.meta.env.BASE_URL}assets/minigame/${section.gameType}/`;
    fetch(`${gameBasePath}gameConfig.json`)
      .then((response) => (response.ok ? (response.json() as Promise<CoinGameConfig>) : null))
      .then((gameConfig) => {
        if (!gameConfig) return;
        preloadImage(resolveAssetPath(gameBasePath, gameConfig.texture));
        preloadAudio(resolveAssetPath(gameBasePath, gameConfig.sound));
      })
      .catch(() => {
        // Missing minigame assets during development are expected; ignore.
      });
  }
}

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
        if (!cancelled) preloadLessonMedia(data, basePath);
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
    const headerSection = config.find((s) => s.type === "header");
    const title = headerSection && "title" in headerSection ? headerSection.title : "English with Fun";
    document.title = `${title} | English with Fun`;
  }, [config]);

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
        <p className={styles.closingMessage}>That&apos;s all, folks!</p>
      </main>
    </>
  );
}

export default LessonPage;
