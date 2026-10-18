import { describe, expect, it } from 'vitest'
import { isBlackKey, midiToLabel, midiToName, nameToMidi } from './pitch'

describe('pitch', () => {
  it('converts names to MIDI numbers', () => {
    expect(nameToMidi('C4')).toBe(60)
    expect(nameToMidi('A4')).toBe(69)
    expect(nameToMidi('Eb4')).toBe(63)
    expect(nameToMidi('C-1')).toBe(0)
  })

  it('converts MIDI numbers to names and labels', () => {
    expect(midiToName(60)).toBe('C')
    expect(midiToLabel(60)).toBe('C4')
    expect(midiToLabel(61)).toBe('C#4')
  })

  it('detects black keys', () => {
    expect(isBlackKey(61)).toBe(true)
    expect(isBlackKey(60)).toBe(false)
    expect(isBlackKey(66)).toBe(true)
  })

  it('rejects invalid input', () => {
    expect(() => nameToMidi('H4')).toThrow()
  })
})
