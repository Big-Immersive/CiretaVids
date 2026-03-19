/**
 * KarimVideo — 20s @ 30fps = 600 frames
 * Karim's brief: institutional RWA video for Cireta
 * Scenes: Opening → Physical B-roll → Verified → Dashboard → Logo
 */
import React from "react";
import { Series, staticFile, Audio } from "remotion";
import { OpeningScene }   from "./scenes/OpeningScene";
import { BRollScene }     from "./BRollScene";
import { VerifiedScene }  from "./scenes/VerifiedScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { FinalLogoScene } from "./scenes/FinalLogoScene";

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

export const KarimVideo: React.FC = () => {
  return (
    <>
      <style>{fontStyles}</style>

      {/* Soundtrack — Darkest Child, Kevin MacLeod CC BY */}
      <Audio src={staticFile("audio/karim_soundtrack.mp3")} volume={0.22} />
      <Audio src={staticFile("audio/karim_vo.mp3")} volume={1} />

      <div style={{ position: "absolute", inset: 0 }}>
        <Series>
          {/* Scene 1: Opening — 0:00–0:03 = 90 frames */}
          <Series.Sequence durationInFrames={90}>
            <OpeningScene />
          </Series.Sequence>

          {/* Scene 2: Physical — AI-generated aerial gold mine (Gemini 3 Pro, QA 4.5/5) */}
          <Series.Sequence durationInFrames={75}>
            <BRollScene
              videoFile="gold_mine_trim.mp4"
              caption="PHYSICAL."
              durationInFrames={75}
            />
          </Series.Sequence>

          {/* Scene 3: Industrial — AI-generated copper cathodes (Gemini 3 Pro, QA 4/5) */}
          <Series.Sequence durationInFrames={75}>
            <BRollScene
              videoFile="copper_trim.mp4"
              caption="REAL RESERVES."
              durationInFrames={75}
            />
          </Series.Sequence>

          {/* Scene 4: Verified — vault + network — 0:08–0:14 = 180 frames */}
          <Series.Sequence durationInFrames={180}>
            <VerifiedScene />
          </Series.Sequence>

          {/* Scene 5: Dashboard — 0:14–0:18 = 120 frames */}
          <Series.Sequence durationInFrames={120}>
            <DashboardScene />
          </Series.Sequence>

          {/* Scene 6: Final logo — 0:18–0:23 = 150 frames */}
          <Series.Sequence durationInFrames={150}>
            <FinalLogoScene />
          </Series.Sequence>
        </Series>
      </div>
    </>
  );
};
