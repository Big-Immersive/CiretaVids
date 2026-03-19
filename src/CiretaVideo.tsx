import React from "react";
import { Series, staticFile, Audio } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { BRollScene } from "./BRollScene";
import { TokenScene } from "./scenes/TokenScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { LogoEndCard } from "./scenes/LogoEndCard";

const fontStyles = `
  @font-face {
    font-family: 'Gilroy';
    src: url('${staticFile("fonts/Gilroy-Bold.woff2")}') format('woff2');
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'Gilroy';
    src: url('${staticFile("fonts/Gilroy-Semibold.woff2")}') format('woff2');
    font-weight: 600;
    font-style: normal;
  }
  @font-face {
    font-family: 'Gilroy';
    src: url('${staticFile("fonts/Gilroy-Medium.woff2")}') format('woff2');
    font-weight: 500;
    font-style: normal;
  }
`;

export const CiretaVideo: React.FC = () => {
  return (
    <>
      <style>{fontStyles}</style>
      {/* Soundtrack — Kevin MacLeod "Slow Burn" CC BY, trimmed & mixed under VO */}
      <Audio src={staticFile("audio/soundtrack.mp3")} volume={0.35} />
      {/* Master VO track — timed against the full composition */}
      <Audio src={staticFile("audio/vo_master.mp3")} volume={1} />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <Series>
          {/* Scene 1: HOOK — 0:00–0:03 = 90 frames */}
          <Series.Sequence durationInFrames={90}>
            <HookScene />
          </Series.Sequence>

          {/* Scene 2: B-ROLL 1 — 0:03–0:06 = 90 frames */}
          <Series.Sequence durationInFrames={90}>
            <BRollScene
              videoFile="furnace_trim.mp4"
              caption="REAL ASSETS"
              durationInFrames={90}
            />
          </Series.Sequence>

          {/* Scene 3: B-ROLL 2 — 0:06–0:10 = 120 frames */}
          <Series.Sequence durationInFrames={120}>
            <BRollScene
              videoFile="containers_trim.mp4"
              caption="VERIFIED & STORED"
              durationInFrames={120}
            />
          </Series.Sequence>

          {/* Scene 4: B-ROLL 3 — 0:10–0:13 = 90 frames */}
          <Series.Sequence durationInFrames={90}>
            <BRollScene
              videoFile="contract_trim.mp4"
              caption="LEGALLY CERTIFIED"
              durationInFrames={90}
            />
          </Series.Sequence>

          {/* Scene 5: B-ROLL 4 — 0:13–0:15 = 60 frames */}
          <Series.Sequence durationInFrames={60}>
            <BRollScene
              videoFile="gold_trim.mp4"
              caption="THEN TOKENIZED"
              durationInFrames={60}
            />
          </Series.Sequence>

          {/* Scene 6: TOKEN 3D — 0:15–0:21 = 180 frames */}
          <Series.Sequence durationInFrames={180}>
            <TokenScene />
          </Series.Sequence>

          {/* Scene 7: CLOSING TEXT — 0:21–0:24 = 90 frames */}
          <Series.Sequence durationInFrames={90}>
            <ClosingScene />
          </Series.Sequence>

          {/* Scene 8: LOGO END CARD — 0:24–0:26 = 60 frames */}
          <Series.Sequence durationInFrames={60}>
            <LogoEndCard />
          </Series.Sequence>
        </Series>
      </div>
    </>
  );
};
