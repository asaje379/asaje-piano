import { describe, expect, it } from 'vitest'
import {
  intervalName,
  keySignatureFor,
  pitchClassOf,
  secondsPerBeat,
  vexKeyForKey,
} from './reading'

describe('keySignatureFor', () => {
  it('gives the diatonic pitch classes of a major key', () => {
    expect(
      keySignatureFor('C')
        .pcs.slice()
        .sort((a, b) => a - b),
    ).toEqual([0, 2, 4, 5, 7, 9, 11])
    expect(
      keySignatureFor('G')
        .pcs.slice()
        .sort((a, b) => a - b),
    ).toEqual([0, 2, 4, 6, 7, 9, 11])
  })

  it('spells F# in G and Bb in F', () => {
    const g = keySignatureFor('G')
    expect(vexKeyForKey(66, g)).toBe('f/4')
    const f = keySignatureFor('F')
    expect(vexKeyForKey(70, f)).toBe('b/4')
  })
})

describe('intervalName', () => {
  it('names intervals by semitone distance', () => {
    expect(intervalName([60, 64])).toBe('tierce majeure')
    expect(intervalName([60, 67])).toBe('quinte juste')
    expect(intervalName([59, 61])).toBe('seconde majeure')
  })
})

describe('secondsPerBeat', () => {
  it('converts tempo to seconds per beat', () => {
    expect(secondsPerBeat(60)).toBeCloseTo(1)
    expect(secondsPerBeat(120)).toBeCloseTo(0.5)
  })
})

describe('pitchClassOf', () => {
  it('wraps pitch classes', () => {
    expect(pitchClassOf(60)).toBe(0)
    expect(pitchClassOf(70)).toBe(10)
  })
})
