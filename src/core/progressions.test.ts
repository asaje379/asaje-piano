import { describe, expect, it } from 'vitest'
import {
  buildProgression,
  degreeToChord,
  parseRoman,
  randomRomanProgression,
  tonicToPc,
} from './progressions'

describe('parseRoman', () => {
  it('reads diatonic degrees and quality', () => {
    expect(parseRoman('I')).toEqual({
      degree: 1,
      accidental: 0,
      quality: 'maj',
    })
    expect(parseRoman('ii')).toEqual({
      degree: 2,
      accidental: 0,
      quality: 'min',
    })
    expect(parseRoman('vii°')).toEqual({
      degree: 7,
      accidental: 0,
      quality: 'dim',
    })
  })

  it('reads accidentals', () => {
    expect(parseRoman('bVII')).toEqual({
      degree: 7,
      accidental: -1,
      quality: 'maj',
    })
  })

  it('rejects invalid tokens', () => {
    expect(() => parseRoman('X')).toThrow()
  })
})

describe('degreeToChord', () => {
  it('builds diatonic chords in C major', () => {
    expect(degreeToChord('I', 'C', 'major')).toMatchObject({
      rootPc: 0,
      quality: 'maj',
      symbol: 'C',
    })
    expect(degreeToChord('vi', 'C', 'major')).toMatchObject({
      rootPc: 9,
      quality: 'min',
      symbol: 'Am',
    })
    expect(degreeToChord('ii', 'C', 'major')).toMatchObject({
      rootPc: 2,
      quality: 'min',
      symbol: 'Dm',
    })
    expect(degreeToChord('vii°', 'C', 'major')).toMatchObject({
      rootPc: 11,
      quality: 'dim',
      symbol: 'Bdim',
    })
  })

  it('builds chords in another key', () => {
    expect(degreeToChord('V', 'G', 'major').symbol).toBe('D')
  })

  it('spells borrowed chords with flats', () => {
    expect(degreeToChord('bVII', 'C', 'major').symbol).toBe('Bb')
  })
})

describe('buildProgression', () => {
  it('maps a full progression', () => {
    const chords = buildProgression(['I', 'V', 'vi', 'IV'], 'C', 'major')
    expect(chords.map((c) => c.symbol)).toEqual(['C', 'G', 'Am', 'F'])
  })
})

describe('randomRomanProgression', () => {
  it('is deterministic with a fixed rng and starts on I', () => {
    let seed = 0
    const rng = () => {
      seed += 1
      return (seed * 0.37) % 1
    }
    const progression = randomRomanProgression(4, 'major', rng)
    expect(progression).toHaveLength(4)
    expect(progression[0]).toBe('I')
  })
})

describe('tonicToPc', () => {
  it('resolves note names', () => {
    expect(tonicToPc('C')).toBe(0)
    expect(tonicToPc('Eb')).toBe(3)
    expect(tonicToPc('F#')).toBe(6)
  })
})
