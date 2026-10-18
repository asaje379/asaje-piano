import type { Mode } from '@/core/progressions'

export interface ArpeggioDef {
  id: string
  label: string
  description: string
  /** Styles où cet arpège est idiomatique. */
  styles: string[]
}

export const ARPEGGIOS: ArpeggioDef[] = [
  {
    id: 'brokenTriad',
    label: 'Triade brisée',
    description:
      'do–mi–sol–do : la base, notes de l’accord une à une, en croches.',
    styles: ['pop', 'classical'],
  },
  {
    id: 'alberti',
    label: 'Basse d’Alberti',
    description:
      'grave–aigu–milieu–aigu (do–sol–mi–sol) : l’accompagnement classique par excellence.',
    styles: ['classical'],
  },
  {
    id: 'boomChuck',
    label: 'Root–5te (boom-chuck)',
    description:
      'fondamentale grave puis accord plaqué : la pulsation folk / country / rock.',
    styles: ['rock', 'folk'],
  },
  {
    id: 'boogie',
    label: 'Boogie / walking bass',
    description:
      'ligne de basse en triolets qui relie les accords : le moteur du blues.',
    styles: ['blues', 'jazz'],
  },
  {
    id: 'shell',
    label: 'Shell 3–7',
    description:
      'quinte à la main gauche, 3ce et 7e à la main droite : le voicing jazz minimal.',
    styles: ['jazz'],
  },
  {
    id: 'octaveFifth',
    label: 'Octave + quinte',
    description:
      'fondamentale doublée à l’octave avec la quinte : la puissance gospel / soul.',
    styles: ['gospel'],
  },
  {
    id: 'rootSeventh',
    label: 'Root–7te–10e',
    description: 'fondamentale, 7e puis 10e : la couleur R&B / soul.',
    styles: ['gospel'],
  },
]

export interface StyleSource {
  label: string
  url: string
  license: string
}

export interface StyleDef {
  id: string
  label: string
  description: string
  mode: Mode
  /** Progressions typiques en degrés romains. */
  progressions: string[]
  /** Arpèges associés (ids de ARPEGGIOS). */
  arpeggios: string[]
  defaultTempo: number
  sources: StyleSource[]
}

export const STYLES: StyleDef[] = [
  {
    id: 'pop',
    label: 'Pop',
    description:
      'Progressions simples et chantables, souvent autour du I, IV, V et vi. Idéal pour la fluidité.',
    mode: 'major',
    progressions: ['I - V - vi - IV', 'vi - IV - I - V', 'I - vi - IV - V'],
    arpeggios: ['brokenTriad', 'boomChuck'],
    defaultTempo: 90,
    sources: [
      {
        label: 'Pixabay — Pop',
        url: 'https://pixabay.com/music/search/genre/pop/',
        license: 'Pixabay (libre, sans attribution)',
      },
    ],
  },
  {
    id: 'rock',
    label: 'Rock',
    description:
      'Accords plaqués et riffs, emprunts au bVII. Bon pour le rythme et les accords ouverts.',
    mode: 'major',
    progressions: ['I - IV - V', 'I - bVII - IV', 'i - VI - III - VII'],
    arpeggios: ['boomChuck', 'brokenTriad'],
    defaultTempo: 110,
    sources: [
      {
        label: 'Free Music Archive — Rock',
        url: 'https://freemusicarchive.org/genre/Rock/',
        license: 'Creative Commons (selon morceau)',
      },
    ],
  },
  {
    id: 'blues',
    label: 'Blues',
    description:
      'Le 12 mesures et le shuffle. La meilleure école pour l’improvisation pentatonique.',
    mode: 'major',
    progressions: ['I - I - I - I - IV - IV - I - I - V - IV - I - V'],
    arpeggios: ['boogie', 'brokenTriad'],
    defaultTempo: 96,
    sources: [
      {
        label: 'wikiloops — Blues',
        url: 'https://www.wikiloops.com/',
        license: 'Creative Commons (selon morceau)',
      },
      {
        label: 'Chosic — Blues',
        url: 'https://www.chosic.com/free-music/blues/',
        license: 'CC0 / domaine public',
      },
    ],
  },
  {
    id: 'jazz',
    label: 'Jazz',
    description:
      'ii–V–I au centre de tout. Accords de 7e, shells et substitutions. Vertu : la finesse.',
    mode: 'major',
    progressions: ['ii - V - I', 'I - vi - ii - V', 'iii - vi - ii - V'],
    arpeggios: ['shell', 'boogie'],
    defaultTempo: 120,
    sources: [
      {
        label: 'Free Music Archive — Jazz',
        url: 'https://freemusicarchive.org/genre/Jazz/',
        license: 'Creative Commons (selon morceau)',
      },
    ],
  },
  {
    id: 'gospel',
    label: 'Gospel / Soul',
    description:
      'Progressions riches avec accords de passage, octaves et couleurs soul. La chaleur.',
    mode: 'major',
    progressions: ['I - vi - ii - V', 'ii - V - I', 'I - iii - vi - IV'],
    arpeggios: ['octaveFifth', 'rootSeventh'],
    defaultTempo: 76,
    sources: [
      {
        label: 'Dossier local backing-tracks-gospel',
        url: '../backing-tracks-gospel',
        license: 'Usage personnel',
      },
      {
        label: 'Free Music Archive — Gospel',
        url: 'https://freemusicarchive.org/genre/Gospel/',
        license: 'Creative Commons (selon morceau)',
      },
    ],
  },
  {
    id: 'classical',
    label: 'Classique',
    description:
      'Enchaînements I–IV–V–I et marches d’harmonie. Le royaume de la basse d’Alberti.',
    mode: 'major',
    progressions: ['I - IV - V - I', 'I - V - vi - iii - IV - I - IV - V'],
    arpeggios: ['alberti', 'brokenTriad'],
    defaultTempo: 84,
    sources: [
      {
        label: 'Musopen (domaine public)',
        url: 'https://musopen.org/',
        license: 'Domaine public',
      },
    ],
  },
]

export function getStyle(id: string): StyleDef | undefined {
  return STYLES.find((style) => style.id === id)
}

export function styleOfTheDay(date: Date = new Date()): StyleDef {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0)
  const dayOfYear = Math.floor((date.getTime() - startOfYear) / 86_400_000)
  return (STYLES[dayOfYear % STYLES.length] ?? STYLES[0]) as StyleDef
}

export function styleOfTheDayId(date?: Date): string {
  return styleOfTheDay(date).id
}
