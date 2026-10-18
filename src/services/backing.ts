import { chordTonePcs, type ChordSpec } from '@/core/chords'
import { ensureContext } from './audio'

type ToneModule = typeof import('tone')
let toneModule: ToneModule | null = null

async function getTone(): Promise<ToneModule> {
  if (!toneModule) toneModule = await import('tone')
  return toneModule
}

export type AccompanimentPattern = 'block' | 'broken' | 'bassChord'

export interface GeneratedTrackOptions {
  chords: ChordSpec[]
  tempo: number
  pattern: AccompanimentPattern
  beatsPerChord?: number
}

export interface GeneratedTrack {
  stop: () => void
}

export async function startGeneratedTrack(
  options: GeneratedTrackOptions,
): Promise<GeneratedTrack> {
  await ensureContext()
  const Tone = await getTone()
  const { chords, tempo, pattern, beatsPerChord = 4 } = options

  const pad = new Tone.PolySynth(Tone.Synth, {
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 },
  }).toDestination()
  pad.volume.value = -18

  const bass = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.4 },
  }).toDestination()
  bass.volume.value = -10

  const freq = (midi: number) => Tone.Frequency(midi, 'midi').toFrequency()

  Tone.Transport.bpm.value = tempo
  let beat = 0

  const loop = new Tone.Loop((time) => {
    const chord = chords[Math.floor(beat / beatsPerChord) % chords.length]
    if (!chord) return
    const beatInChord = beat % beatsPerChord
    const rootMidi = chord.rootPc + 36
    const tones = chordTonePcs(chord.rootPc, chord.quality)
    const voicing = tones.map((pc) => pc + 60)

    if (pattern === 'block') {
      if (beatInChord === 0) {
        pad.triggerAttackRelease(voicing.map(freq), '1n', time)
      }
      if (beatInChord % 2 === 0) {
        bass.triggerAttackRelease(freq(rootMidi), '8n', time)
      }
    } else if (pattern === 'bassChord') {
      if (beatInChord % 2 === 0) {
        bass.triggerAttackRelease(freq(rootMidi), '4n', time)
      } else {
        pad.triggerAttackRelease(voicing.map(freq), '8n', time)
      }
    } else {
      const extended = [...tones, (tones[0] ?? 0) + 12]
      const note = (extended[beat % extended.length] ?? 0) + 60
      pad.triggerAttackRelease(freq(note), '8n', time)
      if (beatInChord === 0) {
        bass.triggerAttackRelease(freq(rootMidi), '2n', time)
      }
    }
    beat += 1
  }, '4n')

  loop.start(0)
  Tone.Transport.start()

  return {
    stop: () => {
      loop.dispose()
      Tone.Transport.stop()
      pad.dispose()
      bass.dispose()
    },
  }
}
