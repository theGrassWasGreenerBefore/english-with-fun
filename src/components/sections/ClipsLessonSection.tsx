import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, PointerEvent } from "react";
import { HeadlessPlayer } from "../../modules/videoPlayer/HeadlessPlayer";
import type { ClipsLessonSection as ClipsLessonSectionData } from "../../types/config";
import type { Sequence, Term, TermsData } from "../../types/terms";
import { resolveAssetPath } from "../../utils/resolveAssetPath";
import { slugify } from "../../utils/slugify";
import { useSectionReveal } from "../../hooks/useSectionReveal";
import styles from "./Section.module.css";
import SectionTitle from "./SectionTitle";

const ICON_PREV = '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM18 6 9.5 12 18 18Z"/></svg>';
const ICON_NEXT = '<svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 6l8.5 6L6 18Z"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 6l10 6-10 6Z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 6h3v12H7zM14 6h3v12h-3z"/></svg>';
const ICON_FULLSCREEN =
  '<svg viewBox="0 0 24 24"><path d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z"/></svg>';

const DEFAULT_VOLUME = 75;
const VOLUME_STEP = 10;

type Entity =
  | { readonly kind: "startEdge" }
  | { readonly kind: "sequence"; readonly sequence: Sequence }
  | { readonly kind: "term"; readonly sequence: Sequence; readonly term: Term }
  | { readonly kind: "endEdge" };

function buildEntities(data: TermsData): readonly Entity[] {
  const termsBySequence = new Map<string, Term[]>();
  for (const term of data.terms) {
    const list = termsBySequence.get(term.sequenceId);
    if (list) list.push(term);
    else termsBySequence.set(term.sequenceId, [term]);
  }

  const entities: Entity[] = [{ kind: "startEdge" }];
  for (const sequence of data.sequences) {
    entities.push({ kind: "sequence", sequence });
    for (const term of termsBySequence.get(sequence.id) ?? []) {
      entities.push({ kind: "term", sequence, term });
    }
  }
  entities.push({ kind: "endEdge" });
  return entities;
}

interface ClipsLessonSectionProps {
  readonly section: ClipsLessonSectionData;
  readonly basePath: string;
}

function ClipsLessonSection({ section, basePath }: ClipsLessonSectionProps) {
  const id = slugify(section.title);
  const { ref, revealed } = useSectionReveal(id);

  const [data, setData] = useState<TermsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [entityIndex, setEntityIndex] = useState(0);
  const [playState, setPlayState] = useState<"playing" | "paused">("playing");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  const mountRef = useRef<HTMLDivElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef(DEFAULT_VOLUME);
  const playerRef = useRef<HeadlessPlayer | null>(null);
  const entitiesRef = useRef<readonly Entity[]>([]);
  const entityIndexRef = useRef(0);

  useEffect(() => {
    entityIndexRef.current = entityIndex;
  }, [entityIndex]);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);

    fetch(resolveAssetPath(basePath, section.clipslesson.terms))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load terms: ${response.status}`);
        }
        return response.json() as Promise<TermsData>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      });

    return () => {
      cancelled = true;
    };
  }, [basePath, section.clipslesson.terms]);

  const entities = useMemo(() => (data ? buildEntities(data) : []), [data]);

  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);

  function enterEntity(index: number): void {
    const target = entities[index];
    const player = playerRef.current;
    if (!target || !player) return;

    setEntityIndex(index);
    if (target.kind === "sequence") {
      setPlayState("playing");
      setIsTransitioning(false);
      player.play(target.sequence.start, target.sequence.end);
    } else if (target.kind === "term") {
      setIsTransitioning(true);
      player.showStillframe(target.term.stillframe, target.term.framingXOffset);
    } else {
      setIsTransitioning(false);
      player.pause();
    }
  }

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !data) return;

    const player = new HeadlessPlayer();
    playerRef.current = player;
    void player
      .init(container, { sourceVideo: resolveAssetPath(basePath, section.clipslesson.sourceVideo) })
      .then(() => player.setVolume(volumeRef.current));

    const handleSequenceOver = () => {
      const index = entityIndexRef.current;
      if (index < entitiesRef.current.length - 1) enterEntity(index + 1);
    };
    const handlePaused = () => setPlayState("paused");
    const handleUnpaused = () => setPlayState("playing");
    const handleSeeked = () => setIsTransitioning(false);

    player.on("sequenceOver", handleSequenceOver);
    player.on("paused", handlePaused);
    player.on("unpaused", handleUnpaused);
    player.on("seeked", handleSeeked);

    return () => {
      player.off("sequenceOver", handleSequenceOver);
      player.off("paused", handlePaused);
      player.off("unpaused", handleUnpaused);
      player.off("seeked", handleSeeked);
      player.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, data, section.clipslesson.sourceVideo]);

  const current = entities[entityIndex];

  function handleNext(): void {
    if (!current || entityIndex >= entities.length - 1) return;
    enterEntity(entityIndex + 1);
  }

  function handlePrev(): void {
    if (!current || entityIndex <= 0) return;
    enterEntity(entityIndex - 1);
  }

  function handlePauseToggle(): void {
    const player = playerRef.current;
    if (!player || current?.kind !== "sequence") return;
    if (playState === "playing") player.pause();
    else player.unpause();
  }

  function applyVolume(percent: number): void {
    const next = Math.min(100, Math.max(0, percent));
    volumeRef.current = next;
    setVolume(next);
    playerRef.current?.setVolume(next);
  }

  function handleVolumeChange(event: ChangeEvent<HTMLInputElement>): void {
    applyVolume(Number(event.target.value));
  }

  function handleFullscreenToggle(): void {
    const target = playerWrapperRef.current;
    if (!target) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else
      void target
        .requestFullscreen()
        .catch((error: unknown) => console.error("ClipsLessonSection: fullscreen failed", error));
  }

  const prevDisabled = !current || current.kind === "startEdge" || isTransitioning;
  const nextDisabled = !current || current.kind === "endEdge" || isTransitioning;
  const pauseDisabled = !current || current.kind !== "sequence" || isTransitioning;
  const showPlayer = current?.kind === "sequence" || current?.kind === "term";
  const clickable = current?.kind === "term" || current?.kind === "startEdge";

  function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("input, button")) return;
    event.currentTarget.focus();
  }

  // Keyboard shortcuts are active while focus is anywhere inside the player.
  // Arrows on a focused range input are left to the native slider behavior,
  // and Space/Enter on a focused button are left to its native activation.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const tagName = event.target instanceof HTMLElement ? event.target.tagName : "";
    if (tagName === "BUTTON" && (event.key === " " || event.key === "Enter")) return;
    if (
      tagName === "INPUT" &&
      (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight")
    ) {
      return;
    }

    switch (event.key) {
      case " ":
        event.preventDefault();
        if (event.repeat) return;
        if (current?.kind === "startEdge") handleNext();
        else if (current?.kind === "sequence") handlePauseToggle();
        return;
      case "ArrowUp":
        event.preventDefault();
        applyVolume(volumeRef.current + VOLUME_STEP);
        return;
      case "ArrowDown":
        event.preventDefault();
        applyVolume(volumeRef.current - VOLUME_STEP);
        return;
      case "ArrowRight":
      case "PageDown":
        event.preventDefault();
        if (!event.repeat && !nextDisabled) handleNext();
        return;
      case "ArrowLeft":
      case "PageUp":
        event.preventDefault();
        if (!event.repeat && !prevDisabled) handlePrev();
        return;
      case "Enter":
        if (current?.kind === "term" || current?.kind === "startEdge") {
          event.preventDefault();
          handleNext();
        }
        return;
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionInner} style={{ fontSize: section.fontSize }} ref={ref}>
        <SectionTitle id={id} revealed={revealed}>
          {section.title}
        </SectionTitle>

        {error && <p className={styles.sectionText}>Failed to load clips lesson: {error}</p>}
        {!error && !data && <p className={styles.sectionText}>Loading clips lesson…</p>}

        {data && (
          <div
            ref={playerWrapperRef}
            className={styles.clipslessonPlayer}
            tabIndex={0}
            role="group"
            aria-label="Video player"
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
          >
            <div className={styles.clipslessonNav}>
              <button
                type="button"
                className={styles.clipslessonNavBtn}
                aria-label="Previous"
                title="Previous"
                disabled={prevDisabled}
                onClick={handlePrev}
                dangerouslySetInnerHTML={{ __html: ICON_PREV }}
              />
              <button
                type="button"
                className={styles.clipslessonNavBtn}
                aria-label={playState === "playing" ? "Pause" : "Play"}
                title={playState === "playing" ? "Pause" : "Play"}
                disabled={pauseDisabled}
                onClick={handlePauseToggle}
                dangerouslySetInnerHTML={{ __html: playState === "playing" ? ICON_PAUSE : ICON_PLAY }}
              />
              <button
                type="button"
                className={styles.clipslessonNavBtn}
                aria-label="Next"
                title="Next"
                disabled={nextDisabled}
                onClick={handleNext}
                dangerouslySetInnerHTML={{ __html: ICON_NEXT }}
              />
              <input
                type="range"
                className={styles.clipslessonVolume}
                min={0}
                max={100}
                value={volume}
                aria-label="Volume"
                onChange={handleVolumeChange}
              />
              <button
                type="button"
                className={styles.clipslessonNavBtn}
                aria-label="Fullscreen"
                title="Fullscreen"
                onClick={handleFullscreenToggle}
                dangerouslySetInnerHTML={{ __html: ICON_FULLSCREEN }}
              />
            </div>

            <div
              className={`${styles.clipslessonContent} ${clickable ? styles.clipslessonContentClickable : ""}`}
              onClick={clickable ? handleNext : undefined}
            >
              <div
                ref={mountRef}
                className={`${styles.clipslessonPlayerMount} ${showPlayer ? "" : styles.clipslessonPlayerHidden}`}
              />
              {current?.kind === "term" && (
                <div className={styles.clipslessonOverlay}>
                  <div className={styles.clipslessonOverlayContent}>
                    <h3
                      className={styles.clipslessonOverlayTitle}
                      dangerouslySetInnerHTML={{ __html: current.term.term }}
                    />
                    <p
                      className={styles.clipslessonOverlayDefinition}
                      dangerouslySetInnerHTML={{ __html: current.term.definition }}
                    />
                    {current.term.image && (
                      <div className={styles.clipslessonOverlayMedia}>
                        <img
                          key={current.term.image}
                          className={styles.clipslessonOverlayImage}
                          src={resolveAssetPath(basePath, current.term.image)}
                          alt={current.term.term}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {current?.kind === "startEdge" && (
                <div className={styles.clipslessonEdgeSlide}>
                  Let&apos;s begin!
                </div>
              )}
              {current?.kind === "endEdge" && (
                <div className={styles.clipslessonEdgeSlide}>Out of a single scene.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ClipsLessonSection;
