import { CHORD_INTERVALS, chordSymbol, type Quality } from '@/core/chords'

export interface DetectedChord {
  rootPc: number
  quality: Quality
  inversion: number
  midis: number[]
  symbol: string
}

const QUALITIES: Quality[] = ['maj', 'min', 'dim', 'aug']

function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12
}

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort((x, y) => x - y)
  const sortedB = [...b].sort((x, y) => x - y)
  return sortedA.every((value, index) => value === sortedB[index])
}

export function detectChord(midis: number[]): DetectedChord | null {
  if (midis.length < 3) return null
  const notes = [...midis].sort((a, b) => a - b)
  const pcs = [...new Set(notes.map(pitchClass))]
  if (pcs.length !== 3) return null

  for (const quality of QUALITIES) {
    const intervals = CHORD_INTERVALS[quality]
    for (let root = 0; root < 12; root += 1) {
      const tonePcs = intervals.map((interval) => (root + interval) % 12)
      if (sameSet(tonePcs, pcs)) {
        const lowestPc = pitchClass(notes[0] ?? 0)
        const inversion = tonePcs.indexOf(lowestPc)
        return {
          rootPc: root,
          quality,
          inversion: inversion < 0 ? 0 : inversion,
          midis: notes,
          symbol: chordSymbol(root, quality),
        }
      }
    }
  }
  return null
}

export function chordPcs(rootPc: number, quality: Quality): number[] {
  return CHORD_INTERVALS[quality].map((interval) => (rootPc + interval) % 12)
}

export function matchesExpected(
  detected: DetectedChord | null,
  expected: { rootPc: number; quality: Quality; inversion: number },
): boolean {
  if (!detected) return false
  return (
    detected.rootPc === expected.rootPc &&
    detected.quality === expected.quality &&
    detected.inversion === expected.inversion
  )
}
