import { chordSymbol, type ChordSpec, type Quality } from './chords'

export type Mode = 'major' | 'minor'

export const NOTE_PCS: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
  'B#': 0,
}

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11]
const NATURAL_MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10]

const ROMAN_DEGREE: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
}

export interface ParsedDegree {
  degree: number
  accidental: number
  quality: Quality
}

export function tonicToPc(tonic: string): number {
  const pc = NOTE_PCS[tonic]
  if (pc === undefined) {
    throw new Error(`Tonalité invalide : "${tonic}"`)
  }
  return pc
}

export function parseRoman(token: string): ParsedDegree {
  const clean = token.trim()
  const match = /^([b#]?)([iIvV]+)(°|o|\+)?$/.exec(clean)
  if (!match) {
    throw new Error(`Degré romain invalide : "${token}"`)
  }
  const accidental = match[1] === 'b' ? -1 : match[1] === '#' ? 1 : 0
  const roman = match[2]
  const symbol = match[3] ?? ''
  const degree = ROMAN_DEGREE[roman.toUpperCase()]
  if (!degree) {
    throw new Error(`Degré romain invalide : "${token}"`)
  }

  let quality: Quality = 'maj'
  if (symbol === '°' || symbol === 'o') {
    quality = 'dim'
  } else if (symbol === '+') {
    quality = 'aug'
  } else if (roman === roman.toLowerCase()) {
    quality = 'min'
  }

  return { degree, accidental, quality }
}

export function preferFlatsFor(tonic: string, accidental: number): boolean {
  if (accidental < 0) return true
  if (accidental > 0) return false
  return tonic.includes('b')
}

export function degreeToChord(
  token: string,
  tonic: string,
  mode: Mode,
): ChordSpec {
  const { degree, accidental, quality } = parseRoman(token)
  const steps = mode === 'major' ? MAJOR_STEPS : NATURAL_MINOR_STEPS
  const tonicPc = tonicToPc(tonic)
  const rootPc = (tonicPc + steps[degree - 1] + accidental + 12) % 12
  const preferFlats = preferFlatsFor(tonic, accidental)
  return {
    rootPc,
    quality,
    symbol: chordSymbol(rootPc, quality, preferFlats),
    degreeLabel: token.trim(),
  }
}

export function buildProgression(
  tokens: string[],
  tonic: string,
  mode: Mode,
): ChordSpec[] {
  return tokens.map((token) => degreeToChord(token, tonic, mode))
}

const COMMON_MAJOR = ['I', 'IV', 'V', 'vi', 'ii', 'iii']
const COMMON_MINOR = ['i', 'iv', 'v', 'VI', 'III', 'VII']

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)] as T
}

export function randomRomanProgression(
  length = 4,
  mode: Mode = 'major',
  rng: () => number = Math.random,
): string[] {
  const pool = mode === 'major' ? COMMON_MAJOR : COMMON_MINOR
  const tokens: string[] = ['I']
  for (let i = 1; i < length; i += 1) {
    let candidate = pick(pool, rng)
    if (candidate === tokens[tokens.length - 1]) {
      candidate = pick(pool, rng)
    }
    tokens.push(candidate)
  }
  return tokens
}

export const KEY_TONICS = [
  'C',
  'Db',
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

export function parseProgressionString(input: string): string[] {
  return input
    .split(/[-–—]/)
    .map((part) => part.trim())
    .filter(Boolean)
}
