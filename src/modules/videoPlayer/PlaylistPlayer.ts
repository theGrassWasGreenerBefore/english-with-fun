// Vanilla embeddable module for the `playlist` section. See AGENTS.md section 4.
import "./PlaylistPlayer.css";
import type { EmbeddableModule } from "../../types/embeddable";

export interface PlaylistPlayerItem {
  readonly title: string;
  readonly subtitle: string;
  readonly src: string;
}

export interface PlaylistPlayerConfig {
  readonly playlist: readonly PlaylistPlayerItem[];
}

const DEFAULT_VOLUME = 0.75;
const SEEK_RANGE_MAX = 1000;

const ICON_PREV = '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM18 6 9.5 12 18 18Z"/></svg>';
const ICON_NEXT = '<svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 6l8.5 6L6 18Z"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 6l10 6-10 6Z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 6h3v12H7zM14 6h3v12h-3z"/></svg>';
const ICON_VOLUME =
  '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 5V4L8 9Zm11.5 3a3.5 3.5 0 0 0-2-3.16v6.32a3.5 3.5 0 0 0 2-3.16Z"/></svg>';
const ICON_FULLSCREEN =
  '<svg viewBox="0 0 24 24"><path d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z"/></svg>';

export class PlaylistPlayer implements EmbeddableModule<PlaylistPlayerConfig> {
  private container: HTMLElement | null = null;
  private abortController: AbortController | null = null;
  private video: HTMLVideoElement | null = null;
  private items: readonly PlaylistPlayerItem[] = [];
  private currentIndex = 0;
  private isSeeking = false;

  private stage: HTMLDivElement | null = null;
  private videoCol: HTMLDivElement | null = null;
  private toggleBtn: HTMLButtonElement | null = null;
  private prevBtn: HTMLButtonElement | null = null;
  private nextBtn: HTMLButtonElement | null = null;
  private timeRange: HTMLInputElement | null = null;
  private volumeRange: HTMLInputElement | null = null;
  private fullscreenBtn: HTMLButtonElement | null = null;
  private sidebarItems: HTMLLIElement[] = [];

  async init(container: HTMLElement, config: PlaylistPlayerConfig): Promise<void> {
    this.items = config.playlist;
    this.currentIndex = 0;
    this.container = container;
    this.abortController = new AbortController();

    container.replaceChildren(this.buildDom());
    this.wireEvents();

    if (this.items.length > 0) this.loadItem(0, { autoplay: false });
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
      console.error("PlaylistPlayer: cleanup failed", error);
    } finally {
      this.container = null;
      this.abortController = null;
      this.video = null;
      this.items = [];
      this.currentIndex = 0;
      this.isSeeking = false;
      this.stage = null;
      this.videoCol = null;
      this.toggleBtn = null;
      this.prevBtn = null;
      this.nextBtn = null;
      this.timeRange = null;
      this.volumeRange = null;
      this.fullscreenBtn = null;
      this.sidebarItems = [];
    }
  }

  private buildDom(): HTMLDivElement {
    const root = document.createElement("div");
    root.className = "vp-playlist";

    const videoCol = document.createElement("div");
    videoCol.className = "vp-playlist__video-col";
    this.videoCol = videoCol;

    const stage = document.createElement("div");
    stage.className = "vp-playlist__stage";
    this.stage = stage;

    const video = document.createElement("video");
    video.className = "vp-playlist__video";
    video.playsInline = true;
    video.volume = DEFAULT_VOLUME;
    this.video = video;
    stage.append(video);

    videoCol.append(stage, this.buildNavbar());
    root.append(videoCol, this.buildSidebar());
    return root;
  }

  private buildNavbar(): HTMLDivElement {
    const navbar = document.createElement("div");
    navbar.className = "vp-playlist__navbar";

    this.prevBtn = this.createIconButton("prev", ICON_PREV, "Previous");
    this.toggleBtn = this.createIconButton("toggle", ICON_PLAY, "Play");
    this.nextBtn = this.createIconButton("next", ICON_NEXT, "Next");

    const timeRange = document.createElement("input");
    timeRange.type = "range";
    timeRange.className = "vp-playlist__time";
    timeRange.min = "0";
    timeRange.max = String(SEEK_RANGE_MAX);
    timeRange.value = "0";
    timeRange.setAttribute("aria-label", "Seek");
    this.timeRange = timeRange;

    const volumeWrap = document.createElement("div");
    volumeWrap.className = "vp-playlist__volume-wrap";
    const volumeIcon = document.createElement("span");
    volumeIcon.className = "vp-playlist__icon";
    volumeIcon.innerHTML = ICON_VOLUME;

    const volumeRange = document.createElement("input");
    volumeRange.type = "range";
    volumeRange.className = "vp-playlist__volume";
    volumeRange.min = "0";
    volumeRange.max = "100";
    volumeRange.value = String(DEFAULT_VOLUME * 100);
    volumeRange.setAttribute("aria-label", "Volume");
    this.volumeRange = volumeRange;
    volumeWrap.append(volumeIcon, volumeRange);

    this.fullscreenBtn = this.createIconButton("fullscreen", ICON_FULLSCREEN, "Fullscreen");

    navbar.append(this.prevBtn, this.toggleBtn, this.nextBtn, timeRange, volumeWrap, this.fullscreenBtn);
    return navbar;
  }

  private createIconButton(action: string, svg: string, label: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "vp-playlist__btn";
    btn.dataset.action = action;
    btn.setAttribute("aria-label", label);
    btn.innerHTML = svg;
    return btn;
  }

  private buildSidebar(): HTMLUListElement {
    const sidebar = document.createElement("ul");
    sidebar.className = "vp-playlist__sidebar";
    this.sidebarItems = this.items.map((item) => {
      const li = document.createElement("li");
      li.className = "vp-playlist__item";

      const title = document.createElement("span");
      title.className = "vp-playlist__item-title";
      title.textContent = item.title;

      const subtitle = document.createElement("span");
      subtitle.className = "vp-playlist__item-subtitle";
      subtitle.textContent = item.subtitle;

      li.append(title, subtitle);
      return li;
    });
    sidebar.append(...this.sidebarItems);
    return sidebar;
  }

  private wireEvents(): void {
    const signal = this.abortController?.signal;
    const video = this.video;
    if (!signal || !video) return;

    this.stage?.addEventListener("click", () => this.togglePause(), { signal });
    this.toggleBtn?.addEventListener("click", () => this.togglePause(), { signal });
    this.prevBtn?.addEventListener("click", () => this.skip(-1), { signal });
    this.nextBtn?.addEventListener("click", () => this.skip(1), { signal });

    video.addEventListener("play", () => this.setToggleIcon(true), { signal });
    video.addEventListener("pause", () => this.setToggleIcon(false), { signal });
    video.addEventListener("ended", () => this.handleEnded(), { signal });
    video.addEventListener("timeupdate", () => this.updateTimeRange(), { signal });

    // Suspend timeupdate-driven updates while the user is dragging, so the
    // thumb doesn't fight playback position during the drag.
    this.timeRange?.addEventListener("pointerdown", () => (this.isSeeking = true), { signal });
    this.timeRange?.addEventListener("pointerup", () => (this.isSeeking = false), { signal });
    this.timeRange?.addEventListener("input", () => this.scrub(), { signal });

    this.volumeRange?.addEventListener("input", () => this.applyVolume(), { signal });
    this.fullscreenBtn?.addEventListener("click", () => this.toggleFullscreen(), { signal });

    this.sidebarItems.forEach((li, index) => {
      li.addEventListener("click", () => this.loadItem(index, { autoplay: true }), { signal });
    });
  }

  private togglePause(): void {
    const video = this.video;
    if (!video) return;
    if (video.paused) void video.play().catch((error: unknown) => console.error("PlaylistPlayer: play failed", error));
    else video.pause();
  }

  private skip(direction: 1 | -1): void {
    const nextIndex = this.currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= this.items.length) return;
    this.loadItem(nextIndex, { autoplay: true });
  }

  private handleEnded(): void {
    const nextIndex = this.currentIndex + 1;
    if (nextIndex < this.items.length) this.loadItem(nextIndex, { autoplay: true });
  }

  private loadItem(index: number, { autoplay }: { autoplay: boolean }): void {
    const item = this.items[index];
    const video = this.video;
    if (!item || !video) return;

    this.currentIndex = index;
    video.src = item.src;
    this.highlightActiveItem();
    this.updateNavButtons();

    if (autoplay) void video.play().catch((error: unknown) => console.error("PlaylistPlayer: play failed", error));
  }

  private highlightActiveItem(): void {
    this.sidebarItems.forEach((li, index) => {
      li.classList.toggle("vp-playlist__item--active", index === this.currentIndex);
    });
  }

  private updateNavButtons(): void {
    if (this.prevBtn) this.prevBtn.disabled = this.currentIndex <= 0;
    if (this.nextBtn) this.nextBtn.disabled = this.currentIndex >= this.items.length - 1;
  }

  private setToggleIcon(playing: boolean): void {
    if (this.toggleBtn) this.toggleBtn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
  }

  private updateTimeRange(): void {
    if (this.isSeeking || !this.video || !this.timeRange) return;
    const { currentTime, duration } = this.video;
    if (!Number.isFinite(duration) || duration <= 0) return;
    this.timeRange.value = String(Math.round((currentTime / duration) * SEEK_RANGE_MAX));
  }

  private scrub(): void {
    if (!this.video || !this.timeRange) return;
    const { duration } = this.video;
    if (!Number.isFinite(duration) || duration <= 0) return;
    this.video.currentTime = (Number(this.timeRange.value) / SEEK_RANGE_MAX) * duration;
  }

  private applyVolume(): void {
    if (!this.video || !this.volumeRange) return;
    this.video.volume = Number(this.volumeRange.value) / 100;
  }

  private toggleFullscreen(): void {
    const target = this.videoCol;
    if (!target) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void target.requestFullscreen().catch((error: unknown) => console.error("PlaylistPlayer: fullscreen failed", error));
  }
}
