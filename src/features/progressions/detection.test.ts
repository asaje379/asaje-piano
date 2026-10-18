import { describe, expect, it } from 'vitest'
import { detectChord, matchesExpected } from './detection'

describe('detectChord', () => {
  it('detects root position triads', () => {
    expect(detectChord([60, 64, 67])).toMatchObject({
      rootPc: 0,
      quality: 'maj',
      inversion: 0,
    })
    expect(detectChord([57, 60, 64])).toMatchObject({
      rootPc: 9,
      quality: 'min',
      inversion: 0,
    })
  })

  it('detects inversions by the lowest note', () => {
    expect(detectChord([64, 67, 72])).toMatchObject({
      rootPc: 0,
      quality: 'maj',
      inversion: 1,
    })
    expect(detectChord([67, 72, 76])).toMatchObject({
      rootPc: 0,
      quality: 'maj',
      inversion: 2,
    })
  })

  it('returns null for incomplete or invalid input', () => {
    expect(detectChord([60, 64])).toBeNull()
    expect(detectChord([60, 64, 67, 71])).toBeNull()
  })
})

describe('matchesExpected', () => {
  it('compares root, quality and inversion', () => {
    const detected = detectChord([64, 67, 72])
    expect(
      matchesExpected(detected, { rootPc: 0, quality: 'maj', inversion: 1 }),
    ).toBe(true)
    expect(
      matchesExpected(detected, { rootPc: 0, quality: 'maj', inversion: 0 }),
    ).toBe(false)
  })
})
