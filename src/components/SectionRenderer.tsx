import type { LessonSection } from "../types/config";
import type { Character } from "../types/script";
import ClipsLessonSection from "./sections/ClipsLessonSection";
import DialoguesSection from "./sections/DialoguesSection";
import HeaderSection from "./sections/HeaderSection";
import MinigameSection from "./sections/MinigameSection";
import PlaylistSection from "./sections/PlaylistSection";
import TextSection from "./sections/TextSection";

interface SectionRendererProps {
  readonly section: LessonSection;
  readonly basePath: string;
  readonly characters: readonly Character[];
}

function SectionRenderer({ section, basePath, characters }: SectionRendererProps) {
  switch (section.type) {
    case "header":
      return <HeaderSection section={section} basePath={basePath} />;
    case "text":
      return <TextSection section={section} basePath={basePath} />;
    case "playlist":
      return <PlaylistSection section={section} basePath={basePath} />;
    case "clipslesson":
      return <ClipsLessonSection section={section} basePath={basePath} />;
    case "minigame":
      return <MinigameSection section={section} basePath={basePath} />;
    case "dialogues":
      return <DialoguesSection section={section} basePath={basePath} characters={characters} />;
  }
}

export default SectionRenderer;
