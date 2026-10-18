import { CHORD_INTERVALS, type ChordSpec } from './chords'

export interface Voicing {
  midis: number[]
  inversion: number
}

export interface MovementBreakdown {
  fromMidis: number[]
  toMidis: number[]
  cost: number
  movements: number[]
  commonTones: number[]
  halfSteps: number
  wholeSteps: number
  largerMoves: number
}

export interface Register {
  low: number
  high: number
  maxSpan?: number
}

export const REGISTERS = {
  left: { low: 40, high: 64, maxSpan: 16 },
  right: { low: 55, high: 83, maxSpan: 16 },
  both: { low: 45, high: 83, maxSpan: 18 },
} as const

export type Hands = keyof typeof REGISTERS

function sorted(midis: number[]): number[] {
  return [...midis].sort((a, b) => a - b)
}

function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12
}

export function generateVoicings(
  spec: ChordSpec,
  register: Register,
): Voicing[] {
  const intervals = CHORD_INTERVALS[spec.quality]
  const tonePcs = intervals.map((interval) => (spec.rootPc + interval) % 12)
  const maxSpan = register.maxSpan ?? 18

  const choices = tonePcs.map((pc) => {
    const options: number[] = []
    for (let midi = register.low; midi <= register.high; midi += 1) {
      if (pitchClass(midi) === pc) options.push(midi)
    }
    return options
  })

  const results: Voicing[] = []
  const walk = (index: number, acc: number[]) => {
    if (index === choices.length) {
      const notes = sorted(acc)
      const span = (notes[notes.length - 1] ?? 0) - (notes[0] ?? 0)
      if (span > maxSpan) return
      const inversion = tonePcs.indexOf(pitchClass(notes[0] ?? 0))
      results.push({ midis: notes, inversion: inversion < 0 ? 0 : inversion })
      return
    }
    for (const midi of choices[index] ?? []) {
      walk(index + 1, [...acc, midi])
    }
  }
  walk(0, [])
  return results
}

export function movementCost(from: number[], to: number[]): number {
  const a = sorted(from)
  const b = sorted(to)
  const n = Math.min(a.length, b.length)
  let sum = 0
  for (let i = 0; i < n; i += 1) {
    sum += Math.abs((a[i] ?? 0) - (b[i] ?? 0))
  }
  return sum
}

export function describeMovement(
  from: number[],
  to: number[],
): MovementBreakdown {
  const a = sorted(from)
  const b = sorted(to)
  const n = Math.min(a.length, b.length)
  const movements: number[] = []
  let cost = 0
  let halfSteps = 0
  let wholeSteps = 0
  let largerMoves = 0

  for (let i = 0; i < n; i += 1) {
    const delta = (b[i] ?? 0) - (a[i] ?? 0)
    movements.push(delta)
    const distance = Math.abs(delta)
    cost += distance
    if (distance === 1) halfSteps += 1
    else if (distance === 2) wholeSteps += 1
    else if (distance > 2) largerMoves += 1
  }

  const fromPcs = new Set(a.map(pitchClass))
  const commonTones = [...new Set(b.map(pitchClass))]
    .filter((pc) => fromPcs.has(pc))
    .sort((x, y) => x - y)

  return {
    fromMidis: a,
    toMidis: b,
    cost,
    movements,
    commonTones,
    halfSteps,
    wholeSteps,
    largerMoves,
  }
}

export function bestTransition(
  from: number[],
  candidates: Voicing[],
): { voicing: Voicing; info: MovementBreakdown } | null {
  let best: { voicing: Voicing; info: MovementBreakdown } | null = null
  for (const candidate of candidates) {
    const cost = movementCost(from, candidate.midis)
    if (!best || cost < best.info.cost) {
      best = {
        voicing: candidate,
        info: describeMovement(from, candidate.midis),
      }
    }
  }
  return best
}

export function voicingWithInversion(
  spec: ChordSpec,
  inversion: number,
  baseOctave = 4,
): number[] {
  const intervals = CHORD_INTERVALS[spec.quality]
  const rootMidi = spec.rootPc + (baseOctave + 1) * 12
  const midis = intervals.map((interval) => rootMidi + interval)
  for (let i = 0; i < inversion % intervals.length; i += 1) {
    const lowest = midis.shift()
    if (lowest !== undefined) midis.push(lowest + 12)
  }
  return sorted(midis)
}

export function voicingFromMidis(spec: ChordSpec, midis: number[]): Voicing {
  const notes = sorted(midis)
  const tonePcs = CHORD_INTERVALS[spec.quality].map(
    (interval) => (spec.rootPc + interval) % 12,
  )
  const inversion = tonePcs.indexOf(pitchClass(notes[0] ?? 0))
  return { midis: notes, inversion: inversion < 0 ? 0 : inversion }
}

export interface SolveStep {
  chord: ChordSpec
  voicing: Voicing
  fromPrevious: MovementBreakdown | null
}

export function solveProgression(
  chords: ChordSpec[],
  startVoicing: number[],
  register: Register = REGISTERS.both,
): SolveStep[] {
  if (chords.length === 0) return []
  const steps: SolveStep[] = []
  let current = sorted(startVoicing)
  steps.push({
    chord: chords[0] as ChordSpec,
    voicing: voicingFromMidis(chords[0] as ChordSpec, current),
    fromPrevious: null,
  })

  for (let i = 1; i < chords.length; i += 1) {
    const chord = chords[i] as ChordSpec
    const window: Register = {
      low: Math.min(...current) - 12,
      high: Math.max(...current) + 12,
      maxSpan: 18,
    }
    const candidates = generateVoicings(chord, window)
    const best = bestTransition(current, candidates)
    if (best) {
      steps.push({ chord, voicing: best.voicing, fromPrevious: best.info })
      current = best.voicing.midis
    } else {
      const fallback = voicingWithInversion(chord, 0, 4)
      steps.push({
        chord,
        voicing: { midis: fallback, inversion: 0 },
        fromPrevious: describeMovement(current, fallback),
      })
      current = fallback
    }
    void register
  }

  return steps
}

export function totalCost(steps: SolveStep[]): number {
  return steps.reduce((sum, step) => sum + (step.fromPrevious?.cost ?? 0), 0)
}
