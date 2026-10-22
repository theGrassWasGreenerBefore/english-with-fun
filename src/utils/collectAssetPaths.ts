// Walks a LessonConfig and collects every media asset path referenced by any
// section, so the caller can start background preloading (see skill/layout
// "Media assets (video, audio, images) are preloaded in background").
import type { LessonConfig } from "../types/config";

interface CollectedAssets {
  readonly images: readonly string[];
  readonly videos: readonly string[];
}

export function collectAssetPaths(config: LessonConfig): CollectedAssets {
  const images: string[] = [];
  const videos: string[] = [];

  for (const section of config) {
    if ("image" in section && section.image) images.push(section.image);
    if ("images" in section && section.images) images.push(...section.images);

    switch (section.type) {
      case "text":
        if (section.contentType === "imageTiles") {
          for (const tile of section.tiles) images.push(tile.image);
        }
        break;
      case "playlist":
        for (const item of section.playlist) videos.push(item.src);
        break;
      case "clipslesson":
        videos.push(section.clipslesson.sourceVideo);
        break;
    }
  }

  return { images, videos };
}
