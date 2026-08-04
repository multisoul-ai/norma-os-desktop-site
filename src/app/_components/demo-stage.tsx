import type { StageContent } from "../site-content";
import { AutoplayVideo } from "./autoplay-video";
import { ProductStage } from "./product-stage";

type DemoStageProps = {
  active?: boolean;
  controls: {
    pause: string;
    play: string;
  };
  loop?: boolean;
  onEnded?: () => void;
  useMobileMedia?: boolean;
  preload?: "none" | "metadata";
  stage: StageContent;
};

export function DemoStage({
  active = true,
  controls,
  loop = true,
  onEnded,
  preload = "none",
  stage,
  useMobileMedia = false,
}: DemoStageProps) {
  return (
    <ProductStage label={stage.label}>
      <AutoplayVideo
        active={active}
        className="product-stage__video"
        key={active ? "active" : "inactive"}
        label={stage.videoLabel}
        loop={loop}
        onEnded={onEnded}
        pauseLabel={controls.pause}
        playLabel={controls.play}
        poster={stage.poster}
        preload={preload}
        sound={stage.audio}
        src={useMobileMedia ? (stage.mobileMedia ?? stage.media) : stage.media}
      />
    </ProductStage>
  );
}
