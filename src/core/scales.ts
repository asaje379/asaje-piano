export type ScaleCategory = 'major' | 'minor' | 'pentatonic' | 'mode' | 'blues'

export interface ScaleDef {
  id: string
  label: string
  intervals: number[]
  category: ScaleCategory
  /** À quoi sert cette gamme, en une phrase. */
  usage: string
  /** Types d'accords sur lesquels elle sonne bien. */
  fits: string[]
}

export const SCALES: ScaleDef[] = [
  {
    id: 'major',
    label: 'Majeure',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    category: 'major',
    usage:
      'La gamme de référence : sert à tout situer et à improviser sur les accords majeurs de la tonalité.',
    fits: ['maj'],
  },
  {
    id: 'pentatonicMajor',
    label: 'Pentatonique majeure',
    intervals: [0, 2, 4, 7, 9],
    category: 'pentatonic',
    usage:
      '5 notes sans demi-tons : idéale pour débuter l’improvisation, elle sonne juste presque partout.',
    fits: ['maj', 'min'],
  },
  {
    id: 'pentatonicMinor',
    label: 'Pentatonique mineure',
    intervals: [0, 3, 5, 7, 10],
    category: 'pentatonic',
    usage:
      'La plus utilisée en pop, blues et rock : très sûre sur un accord mineur ou un blues.',
    fits: ['min', 'blues'],
  },
  {
    id: 'naturalMinor',
    label: 'Mineure naturelle',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    category: 'minor',
    usage:
      'La gamme mineure de base : sert de repère pour tout l’univers mineur.',
    fits: ['min'],
  },
  {
    id: 'harmonicMinor',
    label: 'Mineure harmonique',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    category: 'minor',
    usage:
      'Mineure avec 7e degré haussé : donne la tension d’un V majeur qui résout vers i.',
    fits: ['min', 'dominant'],
  },
  {
    id: 'melodicMinor',
    label: 'Mineure mélodique',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    category: 'minor',
    usage:
      'Mineure adoucie pour la mélodie montante : utile sur les accords de jazz mineur.',
    fits: ['min', 'min7'],
  },
  {
    id: 'dorian',
    label: 'Dorien',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    category: 'mode',
    usage:
      'Mineur au 6e degré élevé : parfaite sur un vamp mineur funky (i7 – IV7).',
    fits: ['min7'],
  },
  {
    id: 'mixolydian',
    label: 'Mixolydien',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    category: 'mode',
    usage:
      'Majeur avec 7e bémol : le mode du blues et du rock sur les accords de dominante.',
    fits: ['dominant', 'blues'],
  },
  {
    id: 'blues',
    label: 'Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    category: 'blues',
    usage:
      'Pentatonique mineure + blue note (5b) : le vocabulaire du blues et du rock.',
    fits: ['blues', 'dominant'],
  },
]

export function getScale(id: string): ScaleDef | undefined {
  return SCALES.find((scale) => scale.id === id)
}

export function scaleMidis(
  tonicPc: number,
  scale: ScaleDef,
  octave = 4,
): number[] {
  const base = tonicPc + (octave + 1) * 12
  return scale.intervals.map((interval) => base + interval)
}
