import React from 'react'
import { Composition, Folder } from 'remotion'
import { PaperForgeLaunch } from './Composition'
import { SceneHook } from './scenes/SceneHook'
import { SceneIntro } from './scenes/SceneIntro'
import { SceneExtraction } from './scenes/SceneExtraction'
import { ScenePromptStudio } from './scenes/ScenePromptStudio'
import { SceneOutro } from './scenes/SceneOutro'
import './index.css'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main Full Launch Video */}
      <Composition
        id="PaperForgeLaunch"
        component={PaperForgeLaunch}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Individual Scene Compositions for Preview in Studio */}
      <Folder name="Scenes">
        <Composition
          id="1-Hook"
          component={SceneHook}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="2-Intro"
          component={SceneIntro}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="3-Extraction"
          component={SceneExtraction}
          durationInFrames={160}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="4-PromptStudio"
          component={ScenePromptStudio}
          durationInFrames={160}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="5-Outro"
          component={SceneOutro}
          durationInFrames={160}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  )
}
