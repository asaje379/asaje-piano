import { describe, expect, it } from 'vitest'
import { buildProgression } from './progressions'
import {
  bestTransition,
  describeMovement,
  generateVoicings,
  movementCost,
  REGISTERS,
  solveProgression,
  voicingWithInversion,
} from './voicing'

const [cMaj] = buildProgression(['I'], 'C', 'major')

describe('generateVoicings', () => {
  it('produces triads containing all chord tones', () => {
    const voicings = generateVoicings(cMaj!, REGISTERS.right)
    expect(voicings.length).toBeGreaterThan(0)
    for (const voicing of voicings) {
      expect(voicing.midis).toHaveLength(3)
      const pcs = voicing.midis.map((m) => m % 12).sort()
      expect(pcs).toEqual([0, 4, 7])
    }
  })

  it('covers all three inversions', () => {
    const voicings = generateVoicings(cMaj!, REGISTERS.right)
    const inversions = new Set(voicings.map((v) => v.inversion))
    expect(inversions).toEqual(new Set([0, 1, 2]))
  })
})

describe('movementCost', () => {
  it('sums absolute semitone moves of sorted voices', () => {
    expect(movementCost([60, 64, 67], [60, 65, 69])).toBe(3)
    expect(movementCost([60, 64, 67], [60, 64, 67])).toBe(0)
  })
})

describe('describeMovement', () => {
  it('identifies common tones and half steps', () => {
    const info = describeMovement([60, 64, 67], [64, 65, 67])
    expect(info.commonTones).toEqual([4, 7])
    expect(info.halfSteps).toBe(1)
    expect(info.cost).toBe(5)
  })
})

describe('bestTransition', () => {
  it('picks the smallest total movement', () => {
    const candidates = generateVoicings(cMaj!, REGISTERS.right)
    const from = [60, 64, 67]
    const best = bestTransition(from, candidates)
    expect(best).not.toBeNull()
    for (const candidate of candidates) {
      expect(best!.info.cost).toBeLessThanOrEqual(
        movementCost(from, candidate.midis),
      )
    }
  })
})

describe('solveProgression', () => {
  const chords = buildProgression(['I', 'IV', 'V', 'I'], 'C', 'major')
  const start = voicingWithInversion(chords[0]!, 0, 4)

  it('keeps the given start voicing', () => {
    const steps = solveProgression(chords, start)
    expect(steps).toHaveLength(4)
    expect(steps[0]!.voicing.midis).toEqual([60, 64, 67])
    expect(steps[0]!.fromPrevious).toBeNull()
  })

  it('reports a cost equal to the movement between consecutive voicings', () => {
    const steps = solveProgression(chords, start)
    for (let i = 1; i < steps.length; i += 1) {
      const expected = movementCost(
        steps[i - 1]!.voicing.midis,
        steps[i]!.voicing.midis,
      )
      expect(steps[i]!.fromPrevious!.cost).toBe(expected)
    }
  })

  it('moves by small distances for a I-IV-V-I in C', () => {
    const steps = solveProgression(chords, start)
    const largest = Math.max(...steps.slice(1).map((s) => s.fromPrevious!.cost))
    expect(largest).toBeLessThanOrEqual(6)
  })
})
