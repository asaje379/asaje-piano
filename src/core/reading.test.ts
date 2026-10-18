import { describe, expect, it } from 'vitest'
import {
  noteName,
  noteNameOptions,
  pitchClassOf,
  randomMelody,
  randomNote,
  randomTriad,
  samePitchClassSet,
} from './reading'

function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648
    return value / 2147483648
  }
}

describe('randomNote', () => {
  it('stays inside the clef range', () => {
    const rng = seeded(1)
    for (let i = 0; i < 50; i += 1) {
      const treble = randomNote('treble', rng)
      expect(treble).toBeGreaterThanOrEqual(60)
      expect(treble).toBeLessThanOrEqual(81)
      const bass = randomNote('bass', rng)
      expect(bass).toBeGreaterThanOrEqual(43)
      expect(bass).toBeLessThanOrEqual(64)
    }
  })
})

describe('noteName', () => {
  it('maps MIDI to pitch-class names', () => {
    expect(noteName(60)).toBe('C')
    expect(noteName(61)).toBe('C#')
    expect(noteName(70)).toBe('A#')
  })
})

describe('noteNameOptions', () => {
  it('includes the correct answer among unique options', () => {
    const rng = seeded(7)
    for (let i = 0; i < 20; i += 1) {
      const midi = randomNote('treble', rng)
      const options = noteNameOptions(midi, 4, rng)
      expect(options).toHaveLength(4)
      expect(new Set(options).size).toBe(4)
      expect(options).toContain(noteName(midi))
    }
  })
})

describe('randomMelody', () => {
  it('has the requested length and valid notes', () => {
    const rng = seeded(3)
    const melody = randomMelody('treble', 5, rng)
    expect(melody.notes).toHaveLength(5)
    for (const note of melody.notes) {
      expect(note.midi).toBeGreaterThanOrEqual(60)
      expect(note.midi).toBeLessThanOrEqual(81)
    }
  })
})

describe('randomTriad', () => {
  it('builds a triad matching its quality', () => {
    const rng = seeded(11)
    const triad = randomTriad('treble', rng)
    expect(triad.midis).toHaveLength(3)
    const rel = triad.midis.map((m) => pitchClassOf(m - triad.rootPc)).sort()
    if (triad.quality === 'maj') expect(rel).toEqual([0, 4, 7])
    if (triad.quality === 'min') expect(rel).toEqual([0, 3, 7])
    if (triad.quality === 'dim') expect(rel).toEqual([0, 3, 6])
  })
})

describe('samePitchClassSet', () => {
  it('compares pitch-class sets regardless of octave', () => {
    expect(samePitchClassSet([60, 64, 67], [67, 72, 76])).toBe(true)
    expect(samePitchClassSet([60, 64, 67], [60, 64, 68])).toBe(false)
  })
})
