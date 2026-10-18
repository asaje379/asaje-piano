import { ensureContext, playChord } from './audio'

type ToneModule = typeof import('tone')
let toneModule: ToneModule | null = null

async function getTone(): Promise<ToneModule> {
  if (!toneModule) toneModule = await import('tone')
  return toneModule
}

export async function playProgression(
  voicings: number[][],
  tempo: number,
  beatsPerChord = 4,
): Promise<void> {
  await ensureContext()
  const Tone = await getTone()
  const secondsPerBeat = 60 / tempo
  const delay = secondsPerBeat * beatsPerChord
  const now = Tone.now() + 0.12
  voicings.forEach((voicing, index) => {
    const duration = delay * 0.92
    void playChord(voicing, duration, now + index * delay)
  })
}

export async function playMelody(
  notes: number[],
  noteDuration = 0.45,
  gap = 0.5,
): Promise<void> {
  await ensureContext()
  const Tone = await getTone()
  const now = Tone.now() + 0.12
  notes.forEach((midi, index) => {
    void playChord([midi], noteDuration, now + index * gap)
  })
}

let click: import('tone').MembraneSynth | null = null
let loop: import('tone').Loop | null = null

export async function startMetronome(
  tempo: number,
  beatsPerBar = 4,
): Promise<void> {
  await ensureContext()
  const Tone = await getTone()
  if (!click) {
    click = new Tone.MembraneSynth().toDestination()
    click.volume.value = -14
  }
  Tone.Transport.bpm.value = tempo
  let beat = 0
  loop?.dispose()
  loop = new Tone.Loop((time) => {
    const downbeat = beat % beatsPerBar === 0
    click?.triggerAttackRelease(downbeat ? 'C3' : 'C2', '32n', time)
    beat += 1
  }, '4n')
  loop.start(0)
  Tone.Transport.start()
}

export async function stopMetronome(): Promise<void> {
  loop?.stop()
  const Tone = await getTone()
  Tone.Transport.stop()
}
