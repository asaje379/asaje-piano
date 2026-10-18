import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('vexflow', () => {
  class Voice {
    static Mode = { SOFT: 1, STRICT: 2, FULL: 3 }
    setMode() {
      return this
    }
    addTickables() {
      return this
    }
    draw() {}
  }
  class StaveNote {
    addModifier() {}
  }
  class Stave {
    addClef() {
      return this
    }
    addKeySignature() {
      return this
    }
    addTimeSignature() {
      return this
    }
    setContext() {
      return this
    }
    draw() {}
  }
  class Renderer {
    static Backends = { SVG: 1, CANVAS: 2 }
    resize() {}
    getContext() {
      return { setFillStyle() {}, setStrokeStyle() {} }
    }
  }
  class Formatter {
    joinVoices() {
      return this
    }
    format() {}
  }
  class Accidental {
    static applyAccidentals() {}
  }
  return { Voice, StaveNote, Stave, Renderer, Formatter, Accidental }
})

vi.mock('tone', () => {
  class Instrument {
    volume = { value: 0 }
    toDestination() {
      return this
    }
    triggerAttackRelease() {}
    triggerAttack() {}
    triggerRelease() {}
    dispose() {}
  }
  return {
    getContext: () => ({ state: 'suspended', rawContext: {} }),
    start: async () => {},
    now: () => 0,
    Frequency: () => ({ toFrequency: () => 440 }),
    Transport: { bpm: { value: 120 }, start() {}, stop() {} },
    Loop: class {
      start() {}
      stop() {}
      dispose() {}
    },
    Synth: Instrument,
    PolySynth: Instrument,
    MembraneSynth: Instrument,
  }
})

import App from './App'

describe('App', () => {
  it('renders the five navigation entries', () => {
    render(<App />)
    for (const label of [
      'Aujourd’hui',
      'Progressions',
      'Gammes & impro',
      'Lecture',
      'Suivi',
    ]) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('opens on the today page with the daily session', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'Aujourd’hui' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Séance du jour')).toBeInTheDocument()
  })

  it('shows the progress dashboard under Suivi', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Suivi' }))
    expect(await screen.findByText('Parcours guidé')).toBeInTheDocument()
    expect(await screen.findByText('Statistiques')).toBeInTheDocument()
  })

  it('shows the style of the day in the scales module', async () => {
    render(<App />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Gammes & impro' }),
    )
    expect(await screen.findByText('Style du jour')).toBeInTheDocument()
  })
})
