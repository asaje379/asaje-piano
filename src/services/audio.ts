import type { PolySynth } from 'tone'

type ToneModule = typeof import('tone')

let toneModule: ToneModule | null = null
let piano: import('smplr').SplendidGrandPiano | null = null
let synth: PolySynth | null = null
let samplePromise: Promise<void> | null = null
let engineMode: 'samples' | 'synth' | 'idle' = 'idle'
const heldStops = new Map<number, () => void>()

async function getTone(): Promise<ToneModule> {
  if (!toneModule) toneModule = await import('tone')
  return toneModule
}

const SAMPLE_LOAD_TIMEOUT_MS = 5000

export function getEngineMode(): 'samples' | 'synth' | 'idle' {
  return engineMode
}

/** Démarre le contexte audio et un synthé de repli immédiatement disponible. */
export async function ensureContext(): Promise<void> {
  const Tone = await getTone()
  if (Tone.getContext().state !== 'running') {
    await Tone.start()
  }
  if (!synth && !piano) {
    synth = new Tone.PolySynth(Tone.Synth, {
      envelope: { attack: 0.005, decay: 0.35, sustain: 0.15, release: 1.2 },
    }).toDestination()
    synth.volume.value = -10
    if (engineMode === 'idle') engineMode = 'synth'
  }
}

/** Charge les échantillons de piano en arrière-plan (repli conservé si échec). */
export async function ensureAudio(): Promise<void> {
  await ensureContext()
  if (samplePromise) return samplePromise
  samplePromise = (async () => {
    try {
      const Tone = await getTone()
      const { SplendidGrandPiano } = await import('smplr')
      const context = Tone.getContext()
        .rawContext as unknown as BaseAudioContext
      const candidate = new SplendidGrandPiano(context, { volume: 90 })
      await Promise.race([
        candidate.ready,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('timeout chargement échantillons')),
            SAMPLE_LOAD_TIMEOUT_MS,
          ),
        ),
      ])
      piano = candidate
      synth?.dispose()
      synth = null
      engineMode = 'samples'
    } catch {
      engineMode = 'synth'
    }
  })()
  return samplePromise
}

function frequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export async function noteOn(midi: number): Promise<void> {
  await ensureContext()
  if (piano) {
    heldStops.get(midi)?.()
    heldStops.set(midi, piano.start({ note: midi, velocity: 100 }))
    return
  }
  synth?.triggerAttack(frequency(midi))
  void ensureAudio()
}

export async function noteOff(midi: number): Promise<void> {
  if (piano) {
    heldStops.get(midi)?.()
    heldStops.delete(midi)
    return
  }
  synth?.triggerRelease(frequency(midi))
}

export async function playChord(
  midis: number[],
  duration = 0.9,
  time?: number,
): Promise<void> {
  await ensureContext()
  if (piano) {
    for (const midi of midis) {
      piano.start({ note: midi, velocity: 96, duration, time })
    }
    return
  }
  const Tone = await getTone()
  const freqs = midis.map((midi) => Tone.Frequency(midi, 'midi').toFrequency())
  synth?.triggerAttackRelease(freqs, duration, time)
}
