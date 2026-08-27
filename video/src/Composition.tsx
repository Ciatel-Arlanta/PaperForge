import React from 'react'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { SceneHook } from './scenes/SceneHook'
import { SceneIntro } from './scenes/SceneIntro'
import { SceneExtraction } from './scenes/SceneExtraction'
import { ScenePromptStudio } from './scenes/ScenePromptStudio'
import { SceneOutro } from './scenes/SceneOutro'

export const PaperForgeLaunch: React.FC = () => {
  return (
    <TransitionSeries>
      {/* 1. The Dilemma / Hook */}
      <TransitionSeries.Sequence durationInFrames={150}>
        <SceneHook />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />

      {/* 2. Introducing PaperForge */}
      <TransitionSeries.Sequence durationInFrames={150}>
        <SceneIntro />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: 'from-right' })}
        timing={linearTiming({ durationInFrames: 15 })}
      />

      {/* 3. Deep Extraction Engine */}
      <TransitionSeries.Sequence durationInFrames={160}>
        <SceneExtraction />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />

      {/* 4. Multi-Agent Prompt Studio */}
      <TransitionSeries.Sequence durationInFrames={160}>
        <ScenePromptStudio />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: 'from-bottom' })}
        timing={linearTiming({ durationInFrames: 15 })}
      />

      {/* 5. Outro & Call to Action */}
      <TransitionSeries.Sequence durationInFrames={160}>
        <SceneOutro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  )
}
