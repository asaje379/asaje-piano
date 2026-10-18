export type Quality = 'maj' | 'min' | 'dim' | 'aug'

export interface ChordSpec {
  /** Pitch class of the chord root, 0-11. */
  rootPc: number
  quality: Quality
  /** Display symbol, e.g. "C", "Am", "Bdim". */
  symbol: string
  /** Roman-numeral label, e.g. "I", "vi", "vii°". */
  degreeLabel: string
}

export const CHORD_INTERVALS: Record<Quality, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
}

export const QUALITY_SUFFIX: Record<Quality, string> = {
  maj: '',
  min: 'm',
  dim: 'dim',
  aug: 'aug',
}

const SHARP_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]

const FLAT_NAMES = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
]

export function pcToName(pc: number, preferFlats = false): string {
  const names = preferFlats ? FLAT_NAMES : SHARP_NAMES
  return names[((pc % 12) + 12) % 12]
}

export function chordSymbol(
  rootPc: number,
  quality: Quality,
  preferFlats = false,
): string {
  return `${pcToName(rootPc, preferFlats)}${QUALITY_SUFFIX[quality]}`
}

export function chordTonePcs(rootPc: number, quality: Quality): number[] {
  return CHORD_INTERVALS[quality].map((interval) => (rootPc + interval) % 12)
}
