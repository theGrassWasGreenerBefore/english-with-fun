// Starts background preloading of media assets without blocking rendering.
// Fire-and-forget: failures (e.g. missing dev-time media) are ignored, since
// core/constraints says missing media during development is normal.

export function preloadImage(absolutePath: string): void {
  const img = new Image();
  img.src = absolutePath;
}

export function preloadVideo(absolutePath: string): void {
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.src = absolutePath;
}

export function preloadAudio(absolutePath: string): void {
  const audio = new Audio();
  audio.preload = "auto";
  audio.src = absolutePath;
}

export function preloadAssets(images: readonly string[], videos: readonly string[]): void {
  for (const image of images) preloadImage(image);
  for (const video of videos) preloadVideo(video);
}
