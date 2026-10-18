export const NOTE_NAMES = [
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
] as const

export const BLACK_PITCH_CLASSES = [1, 3, 6, 8, 10] as const

const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  Cb: 'B',
  Fb: 'E',
}

export function midiToPitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12
}

export function midiToName(midi: number): string {
  return NOTE_NAMES[midiToPitchClass(midi)]
}

export function midiToLabel(midi: number): string {
  return `${NOTE_NAMES[midiToPitchClass(midi)]}${Math.floor(midi / 12) - 1}`
}

export function isBlackKey(midi: number): boolean {
  return (BLACK_PITCH_CLASSES as readonly number[]).includes(
    midiToPitchClass(midi),
  )
}

export function nameToMidi(name: string): number {
  const match = /^([A-Ga-g])(#|b)?(-?\d+)$/.exec(name.trim())
  if (!match) {
    throw new Error(`Nom de note invalide : "${name}"`)
  }
  const letter = match[1].toUpperCase()
  const accidental = match[2] ?? ''
  const octave = Number(match[3])
  const normalized = accidental ? `${letter}${accidental}` : letter
  const sharp = FLAT_TO_SHARP[normalized] ?? normalized
  const pitchClass = NOTE_NAMES.indexOf(sharp as (typeof NOTE_NAMES)[number])
  return pitchClass + (octave + 1) * 12
}
