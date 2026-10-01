import type { TextSection as TextSectionData } from "../../types/config";
import BulletPointsContent from "./text/BulletPointsContent";
import HostContent from "./text/HostContent";
import ImageTilesContent from "./text/ImageTilesContent";
import NumberPointsContent from "./text/NumberPointsContent";
import TextContent from "./text/TextContent";
import TilesContent from "./text/TilesContent";

interface TextSectionProps {
  readonly section: TextSectionData;
  readonly basePath: string;
}

function TextSection({ section, basePath }: TextSectionProps) {
  switch (section.contentType) {
    case "host":
      return <HostContent section={section} basePath={basePath} />;
    case "text":
      return <TextContent section={section} basePath={basePath} />;
    case "bulletPoints":
      return <BulletPointsContent section={section} basePath={basePath} />;
    case "numberPoints":
      return <NumberPointsContent section={section} basePath={basePath} />;
    case "tiles":
      return <TilesContent section={section} basePath={basePath} />;
    case "imageTiles":
      return <ImageTilesContent section={section} basePath={basePath} />;
  }
}

export default TextSection;
