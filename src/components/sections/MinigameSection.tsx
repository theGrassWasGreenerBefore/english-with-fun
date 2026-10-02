import { useEffect, useRef, useState } from "react";
import { CoinGame } from "../../modules/minigame/CoinGame";
import type { MinigameSection as MinigameSectionData } from "../../types/config";
import type { CoinGameConfig } from "../../types/coinGame";
import { resolveAssetPath } from "../../utils/resolveAssetPath";
import SectionLayout from "./SectionLayout";
import styles from "./Section.module.css";

interface MinigameSectionProps {
  readonly section: MinigameSectionData;
  readonly basePath: string;
}

// WebGL minigame internals are implemented by /skill-minigame; this is layout only.
function MinigameSection({ section, basePath }: MinigameSectionProps) {
  const image = section.image ? (
    <img
      src={resolveAssetPath(basePath, section.image)}
      alt=""
      className={styles.sectionImage}
      style={{ width: section.imageWidth, height: section.imageHeight }}
    />
  ) : undefined;

  const isCoin = section.gameType === "coin";
  const gameBasePath = `/assets/minigame/${section.gameType}/`;

  const [config, setConfig] = useState<CoinGameConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCoin) return;
    let cancelled = false;
    setConfig(null);
    setError(null);

    fetch(`${gameBasePath}gameConfig.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load game config: ${response.status}`);
        }
        return response.json() as Promise<CoinGameConfig>;
      })
      .then((json) => {
        if (!cancelled) setConfig(json);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      });

    return () => {
      cancelled = true;
    };
  }, [isCoin, gameBasePath]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !config) return;

    const game = new CoinGame();
    void game.init(container, {
      ...config,
      texture: resolveAssetPath(gameBasePath, config.texture),
      sound: resolveAssetPath(gameBasePath, config.sound),
    });

    return () => game.destroy();
  }, [config, gameBasePath]);

  return (
    <SectionLayout orientation={section.imageOrientation} image={image} fontSize={section.fontSize}>
      {!isCoin && <div className={styles.placeholderBox}>Minigame placeholder ({section.gameType})</div>}
      {isCoin && error && <p className={styles.sectionText}>Failed to load minigame: {error}</p>}
      {isCoin && !error && !config && <p className={styles.sectionText}>Loading minigame…</p>}
      {isCoin && config && <div ref={mountRef} className={styles.coinGameMount} />}
    </SectionLayout>
  );
}

export default MinigameSection;
