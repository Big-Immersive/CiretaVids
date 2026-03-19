import React from "react";
import { Composition, registerRoot } from "remotion";
import { CiretaVideo } from "./CiretaVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CiretaVideo"
        component={CiretaVideo}
        durationInFrames={780}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

registerRoot(RemotionRoot);
