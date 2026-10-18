import { CHORD_INTERVALS, type Quality } from './chords'
import { NOTE_NAMES } from './pitch'
import { NOTE_PCS } from './progressions'

export type Clef = 'treble' | 'bass'
export type Duration = 'w' | 'h' | 'q' | '8'

export interface ReadingNote {
  midi: number
  duration: Duration
}

export interface Melody {
  clef: Clef
  notes: ReadingNote[]
}

export interface ReadingTriad {
  rootPc: number
  quality: Quality
  midis: number[]
}

const RANGES: Record<Clef, [number, number]> = {
  treble: [60, 81],
  bass: [43, 64],
}

const DURATIONS: Duration[] = ['q', 'q', 'q', 'h', '8', '8']

export function pitchClassOf(midi: number): number {
  return ((midi % 12) + 12) % 12
}

export function noteName(midi: number): string {
  return NOTE_NAMES[pitchClassOf(midi)] ?? 'C'
}

export function randomNote(
  clef: Clef,
  rng: () => number = Math.random,
): number {
  const [low, high] = RANGES[clef]
  return low + Math.floor(rng() * (high - low + 1))
}

export function noteNameOptions(
  correctMidi: number,
  count = 4,
  rng: () => number = Math.random,
): string[] {
  const correct = noteName(correctMidi)
  const set = new Set<string>([correct])
  while (set.size < count) {
    set.add(NOTE_NAMES[Math.floor(rng() * 12)] ?? 'C')
  }
  const options = [...set]
  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const a = options[i] as string
    const b = options[j] as string
    options[i] = b
    options[j] = a
  }
  return options
}

export function randomMelody(
  clef: Clef,
  length = 5,
  rng: () => number = Math.random,
): Melody {
  const notes: ReadingNote[] = []
  for (let i = 0; i < length; i += 1) {
    notes.push({
      midi: randomNote(clef, rng),
      duration: DURATIONS[Math.floor(rng() * DURATIONS.length)] ?? 'q',
    })
  }
  return { clef, notes }
}

const TRIAD_QUALITIES: Quality[] = ['maj', 'min', 'dim']

export function randomTriad(
  clef: Clef,
  rng: () => number = Math.random,
): ReadingTriad {
  const rootPc = Math.floor(rng() * 12)
  const quality =
    TRIAD_QUALITIES[Math.floor(rng() * TRIAD_QUALITIES.length)] ?? 'maj'
  const [low, high] = RANGES[clef]
  let rootMidi = low
  while (rootMidi % 12 !== rootPc && rootMidi <= high) rootMidi += 1
  if (rootMidi > high) rootMidi = low
  const midis = CHORD_INTERVALS[quality].map((interval) => rootMidi + interval)
  return { rootPc, quality, midis }
}

export function durationBeats(duration: Duration): number {
  switch (duration) {
    case 'w':
      return 4
    case 'h':
      return 2
    case 'q':
      return 1
    case '8':
      return 0.5
    default:
      return 1
  }
}

export function samePitchClassSet(a: number[], b: number[]): boolean {
  const setA = new Set(a.map(pitchClassOf))
  const setB = new Set(b.map(pitchClassOf))
  if (setA.size !== setB.size) return false
  for (const pc of setA) if (!setB.has(pc)) return false
  return true
}

export interface KeySignature {
  label: string
  scaleNames: string[]
  pcs: number[]
  lettersByPc: Record<number, string>
}

export const KEY_SIGNATURE_TONICS = [
  'C',
  'C#',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
]

const keySignatureCache = new Map<string, KeySignature>()

const MAJOR_SCALES: Record<string, string[]> = {
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'C#': ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'],
  Db: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  Eb: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  Ab: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  Bb: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
}

export function keySignatureFor(tonic: string): KeySignature {
  const cached = keySignatureCache.get(tonic)
  if (cached) return cached
  const scaleNames = MAJOR_SCALES[tonic] ?? MAJOR_SCALES.C ?? []
  const pcs = scaleNames.map((name) => NOTE_PCS[name] ?? 0)
  const lettersByPc: Record<number, string> = {}
  scaleNames.forEach((name, index) => {
    const pc = pcs[index]
    if (pc !== undefined) lettersByPc[pc] = (name[0] ?? 'c').toLowerCase()
  })
  const signature: KeySignature = { label: tonic, scaleNames, pcs, lettersByPc }
  keySignatureCache.set(tonic, signature)
  return signature
}

export function randomNoteForKey(
  clef: Clef,
  keySig: KeySignature,
  rng: () => number = Math.random,
): number {
  const [low, high] = RANGES[clef]
  const candidates: number[] = []
  for (let midi = low; midi <= high; midi += 1) {
    if (keySig.pcs.includes(pitchClassOf(midi))) candidates.push(midi)
  }
  return candidates[Math.floor(rng() * candidates.length)] ?? low
}

export function vexKeyForKey(midi: number, keySig: KeySignature): string {
  const pc = pitchClassOf(midi)
  const letter = keySig.lettersByPc[pc] ?? (NOTE_NAMES[pc] ?? 'C').toLowerCase()
  return `${letter}/${Math.floor(midi / 12) - 1}`
}

export function randomInterval(
  clef: Clef,
  rng: () => number = Math.random,
): number[] {
  const [low, high] = RANGES[clef]
  const size = 1 + Math.floor(rng() * 11)
  const base = low + Math.floor(rng() * (high - low - size + 1))
  return [base, base + size]
}

const INTERVAL_NAMES: Record<number, string> = {
  1: 'seconde mineure',
  2: 'seconde majeure',
  3: 'tierce mineure',
  4: 'tierce majeure',
  5: 'quarte juste',
  6: 'triton',
  7: 'quinte juste',
  8: 'sixte mineure',
  9: 'sixte majeure',
  10: 'septième mineure',
  11: 'septième majeure',
  12: 'octave',
}

export function intervalName(midis: number[]): string {
  if (midis.length < 2) return ''
  const size = Math.abs((midis[1] ?? 0) - (midis[0] ?? 0))
  return INTERVAL_NAMES[size] ?? `${size} demi-tons`
}

export function secondsPerBeat(tempo: number): number {
  return 60 / tempo
}

export function randomMelodyForKey(
  clef: Clef,
  keySig: KeySignature,
  length = 5,
  rng: () => number = Math.random,
): Melody {
  const notes: ReadingNote[] = []
  for (let i = 0; i < length; i += 1) {
    notes.push({
      midi: randomNoteForKey(clef, keySig, rng),
      duration: DURATIONS[Math.floor(rng() * DURATIONS.length)] ?? 'q',
    })
  }
  return { clef, notes }
}

export function randomIntervalForKey(
  clef: Clef,
  keySig: KeySignature,
  rng: () => number = Math.random,
): number[] {
  const [low, high] = RANGES[clef]
  const base = randomNoteForKey(clef, keySig, rng)
  const candidates: number[] = []
  for (
    let midi = Math.max(low, base - 12);
    midi <= Math.min(high, base + 12);
    midi += 1
  ) {
    if (midi !== base && keySig.pcs.includes(pitchClassOf(midi))) {
      candidates.push(midi)
    }
  }
  const second = candidates[Math.floor(rng() * candidates.length)] ?? base + 7
  return [base, second].sort((a, b) => a - b)
}
