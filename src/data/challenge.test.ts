import { describe, expect, it } from 'vitest'
import { allChallengeProgressions, CHALLENGE } from './challenge'

describe('challenge dataset', () => {
  it('has 30 days of 3 progressions', () => {
    expect(CHALLENGE).toHaveLength(30)
    for (const day of CHALLENGE) {
      expect(day).toHaveLength(3)
    }
  })

  it('flattens to 90 entries with their day', () => {
    const all = allChallengeProgressions()
    expect(all).toHaveLength(90)
    expect(all[0]).toEqual({ day: 1, roman: 'I - IV - V - I' })
    expect(all[89]!.day).toBe(30)
  })
})
