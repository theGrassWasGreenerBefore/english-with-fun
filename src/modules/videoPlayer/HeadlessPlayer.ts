// Headless vanilla module for the `clipslesson` section. See AGENTS.md section 4.
// Owns the <video> element only; never reads terms.json or decides sequence/term state.
import "./HeadlessPlayer.css";
import type { EmbeddableModule } from "../../types/embeddable";

export interface HeadlessPlayerConfig {
  readonly sourceVideo: string;
}

export type HeadlessPlayerEvent = "sequenceOver" | "paused" | "unpaused" | "seeked";
type EventHandler = () => void;

// Guards against the "already at the target frame" case, where no real seek
// occurs and the native `seeked` event never fires.
const SEEK_EPSILON = 0.05;

function parseTimecode(time: string): number {
  const [minutes, seconds] = time.split(":");
  return Number(minutes) * 60 + Number(seconds);
}

export class HeadlessPlayer implements EmbeddableModule<HeadlessPlayerConfig> {
  private container: HTMLElement | null = null;
  private abortController: AbortController | null = null;
  private video: HTMLVideoElement | null = null;
  private stage: HTMLDivElement | null = null;
  private progressFill: HTMLDivElement | null = null;

  private state: "playing" | "paused" | "termShowed" = "paused";
  private rangeStart = 0;
  private rangeEnd: number | null = null;
  private boundaryReached = false;
  private pendingSeekCallback: (() => void) | null = null;

  private listeners = new Map<HeadlessPlayerEvent, Set<EventHandler>>();

  async init(container: HTMLElement, config: HeadlessPlayerConfig): Promise<void> {
    this.container = container;
    this.abortController = new AbortController();
    this.state = "paused";

    container.replaceChildren(this.buildDom(config.sourceVideo));
    this.wireEvents();
  }

  destroy(): void {
    try {
      this.abortController?.abort();
      if (this.video) {
        this.video.pause();
        this.video.removeAttribute("src");
        this.video.load();
      }
      this.container?.replaceChildren();
    } catch (error) {
      console.error("HeadlessPlayer: cleanup failed", error);
    } finally {
      this.container = null;
      this.abortController = null;
      this.video = null;
      this.stage = null;
      this.progressFill = null;
      this.state = "paused";
      this.rangeStart = 0;
      this.rangeEnd = null;
      this.boundaryReached = false;
      this.pendingSeekCallback = null;
      this.listeners.clear();
    }
  }

  play(time: string, stopAt?: string): void {
    const video = this.video;
    if (!video) return;

    video.style.transform = "";
    this.rangeStart = parseTimecode(time);
    this.rangeEnd = stopAt !== undefined ? parseTimecode(stopAt) : null;
    this.boundaryReached = false;
    this.state = "playing";
    video.currentTime = this.rangeStart;
    void video.play().catch((error: unknown) => console.error("HeadlessPlayer: play failed", error));
  }

  pause(): void {
    if (this.state !== "playing" || !this.video) return;
    this.video.pause();
    this.state = "paused";
    this.emit("paused");
  }

  unpause(): void {
    if (this.state !== "paused" || !this.video) return;
    this.state = "playing";
    void this.video.play().catch((error: unknown) => console.error("HeadlessPlayer: play failed", error));
    this.emit("unpaused");
  }

  setVolume(percent: number): void {
    if (!this.video) return;
    this.video.volume = Math.min(100, Math.max(0, percent)) / 100;
  }

  showStillframe(stillframe: string, framingXOffset: number): void {
    const video = this.video;
    if (!video) return;

    this.state = "termShowed";
    video.pause();

    const target = parseTimecode(stillframe);
    const applyFrame = () => {
      video.style.transform = `translateX(-${framingXOffset}%)`;
      this.emit("seeked");
    };

    if (Math.abs(video.currentTime - target) < SEEK_EPSILON) {
      applyFrame();
      return;
    }
    this.pendingSeekCallback = applyFrame;
    video.currentTime = target;
  }

  on(event: HeadlessPlayerEvent, handler: EventHandler): void {
    let handlers = this.listeners.get(event);
    if (!handlers) {
      handlers = new Set();
      this.listeners.set(event, handlers);
    }
    handlers.add(handler);
  }

  off(event: HeadlessPlayerEvent, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: HeadlessPlayerEvent): void {
    this.listeners.get(event)?.forEach((handler) => handler());
  }

  private buildDom(sourceVideo: string): HTMLDivElement {
    const root = document.createElement("div");
    root.className = "vp-headless";

    const stage = document.createElement("div");
    stage.className = "vp-headless__stage";
    this.stage = stage;

    const video = document.createElement("video");
    video.className = "vp-headless__video";
    video.playsInline = true;
    video.src = sourceVideo;
    this.video = video;

    const progress = document.createElement("div");
    progress.className = "vp-headless__progress";
    const fill = document.createElement("div");
    fill.className = "vp-headless__progress-fill";
    this.progressFill = fill;
    progress.append(fill);

    stage.append(video, progress);
    root.append(stage);
    return root;
  }

  private wireEvents(): void {
    const signal = this.abortController?.signal;
    const video = this.video;
    if (!signal || !video) return;

    this.stage?.addEventListener("click", () => this.handleStageClick(), { signal });
    video.addEventListener("timeupdate", () => this.handleTimeUpdate(), { signal });
    video.addEventListener("ended", () => this.handleBoundaryReached(), { signal });
    video.addEventListener("seeked", () => this.handleSeeked(), { signal });
  }

  private handleStageClick(): void {
    if (this.state === "playing") this.pause();
    else if (this.state === "paused") this.unpause();
  }

  private handleTimeUpdate(): void {
    const video = this.video;
    if (!video) return;

    if (this.state === "playing" && this.rangeEnd !== null && video.currentTime >= this.rangeEnd) {
      this.handleBoundaryReached();
      return;
    }
    this.updateProgress();
  }

  private handleBoundaryReached(): void {
    if (this.boundaryReached) return;
    this.boundaryReached = true;
    this.video?.pause();
    this.emit("sequenceOver");
  }

  private handleSeeked(): void {
    const callback = this.pendingSeekCallback;
    this.pendingSeekCallback = null;
    callback?.();
  }

  private updateProgress(): void {
    const video = this.video;
    if (!video || !this.progressFill) return;

    const duration = this.rangeEnd !== null ? this.rangeEnd - this.rangeStart : video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const ratio = Math.min(1, Math.max(0, (video.currentTime - this.rangeStart) / duration));
    this.progressFill.style.width = `${ratio * 100}%`;
  }
}
