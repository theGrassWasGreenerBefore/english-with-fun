// Shapes for config.json, the root per-lesson file. See AGENTS.md sections 4-5.

export type ImageOrientation = "left" | "right" | "top" | "bottom";

// Overall section font-size override. A plain CSS length/size string
// (e.g. "20px", "1.2rem"); when absent the built-in default size applies.
export interface SectionFontSizing {
  readonly fontSize?: string;
}

// Section-level single-image size override. A plain CSS length string
// (e.g. "320px", "40%"); when absent the image keeps its default sizing.
export interface SectionImageSizing {
  readonly imageWidth?: string;
  readonly imageHeight?: string;
}

export interface HeaderSection extends SectionFontSizing {
  readonly type: "header";
  readonly title: string;
  readonly subtitle: string;
  readonly background: string;
}

export interface HostSection extends SectionFontSizing, SectionImageSizing {
  readonly type: "text";
  readonly contentType: "host";
  readonly imageOrientation?: ImageOrientation;
  readonly image?: string;
  readonly name: string;
  readonly location: string;
  readonly jobTitle: string;
}

export interface TextContentSection extends SectionFontSizing, SectionImageSizing {
  readonly type: "text";
  readonly contentType: "text";
  readonly imageOrientation?: ImageOrientation;
  readonly image?: string;
  readonly images?: readonly string[];
  readonly title: string;
  readonly text: string;
}

export interface BulletPointsSection extends SectionFontSizing, SectionImageSizing {
  readonly type: "text";
  readonly contentType: "bulletPoints";
  readonly imageOrientation?: ImageOrientation;
  readonly image?: string;
  readonly title: string;
  readonly subTitle?: string;
  readonly bulletPoints: readonly string[];
}

export interface NumberPointsSection extends SectionFontSizing, SectionImageSizing {
  readonly type: "text";
  readonly contentType: "numberPoints";
  readonly imageOrientation?: ImageOrientation;
  readonly image?: string;
  readonly title: string;
  readonly subTitle?: string;
  readonly numberPoints: readonly string[];
}

// Plain HTML-string tiles (e.g. "Tips to enhance your experience").
export interface TilesSection extends SectionFontSizing, SectionImageSizing {
  readonly type: "text";
  readonly contentType: "tiles";
  readonly imageOrientation?: ImageOrientation;
  readonly image?: string;
  readonly title: string;
  readonly tiles: readonly string[];
}

export interface Tile {
  readonly image: string;
  readonly textOrientation: string;
  readonly title: string;
  readonly subTitle: string;
  readonly id: string;
  readonly scriptTitle: string;
  readonly color: string;
}

// Character-card tiles (the "Characters" section), distinct from TilesSection
// because its tiles are objects, not strings.
export interface ImageTilesSection extends SectionFontSizing {
  readonly type: "text";
  readonly contentType: "imageTiles";
  readonly title: string;
  readonly tiles: readonly Tile[];
}

export type TextSection =
  | HostSection
  | TextContentSection
  | BulletPointsSection
  | NumberPointsSection
  | TilesSection
  | ImageTilesSection;

export interface PlaylistItem {
  readonly title: string;
  readonly subtitle: string;
  readonly src: string;
}

export interface PlaylistSection extends SectionFontSizing {
  readonly type: "playlist";
  readonly title: string;
  readonly playlist: readonly PlaylistItem[];
}

export interface ClipsLessonData {
  readonly sourceVideo: string;
  readonly terms: string;
}

export interface ClipsLessonSection extends SectionFontSizing {
  readonly type: "clipslesson";
  readonly title: string;
  readonly clipslesson: ClipsLessonData;
}

export interface MinigameSection extends SectionFontSizing, SectionImageSizing {
  readonly type: "minigame";
  readonly gameType: string;
  readonly imageOrientation?: ImageOrientation;
  readonly image?: string;
}

export interface DialoguesSection extends SectionFontSizing {
  readonly type: "dialogues";
  readonly lines: string;
}

export type LessonSection =
  | HeaderSection
  | TextSection
  | PlaylistSection
  | ClipsLessonSection
  | MinigameSection
  | DialoguesSection;

export type LessonConfig = readonly LessonSection[];
