import React from "react";
import { Composition, registerRoot } from "remotion";
import { CiretaVideo } from "./CiretaVideo";
import { KarimVideo }  from "./KarimVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* v1 General — 26s */}
      <Composition
        id="CiretaVideo"
        component={CiretaVideo}
        durationInFrames={780}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Karim brief — 20s — 1920×1080 */}
      <Composition
        id="KarimVideo-16x9"
        component={KarimVideo}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Karim brief — 20s — 1080×1080 (1:1) */}
      <Composition
        id="KarimVideo-1x1"
        component={KarimVideo}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1080}
      />
      {/* Karim brief — 20s — 1080×1920 (9:16) */}
      <Composition
        id="KarimVideo-9x16"
        component={KarimVideo}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

registerRoot(RemotionRoot);
