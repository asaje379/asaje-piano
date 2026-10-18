export interface WeekPlan {
  week: number
  style: string
  focus: string
  progression: string
  arpeggio: string
  reading: string
}

export const CURRICULUM: WeekPlan[] = [
  {
    week: 1,
    style: 'pop',
    focus: 'Fluidité I–V–vi–IV',
    progression: 'I - V - vi - IV',
    arpeggio: 'Triade brisée',
    reading: 'Nommer la note',
  },
  {
    week: 2,
    style: 'classical',
    focus: 'Enchaînements I–IV–V–I',
    progression: 'I - IV - V - I',
    arpeggio: 'Basse d’Alberti',
    reading: 'Jouer la note',
  },
  {
    week: 3,
    style: 'blues',
    focus: '12 mesures & shuffle',
    progression: 'I - IV - V - I',
    arpeggio: 'Boogie / walking bass',
    reading: 'Lecture à vue',
  },
  {
    week: 4,
    style: 'jazz',
    focus: 'ii–V–I',
    progression: 'ii - V - I',
    arpeggio: 'Shell 3–7',
    reading: 'Jouer l’accord',
  },
  {
    week: 5,
    style: 'gospel',
    focus: 'Grilles enrichies',
    progression: 'I - vi - ii - V',
    arpeggio: 'Octave + quinte',
    reading: 'Jouer l’intervalle',
  },
  {
    week: 6,
    style: 'rock',
    focus: 'Emprunts & rythme',
    progression: 'I - bVII - IV',
    arpeggio: 'Root–5te',
    reading: 'Lecture à vue',
  },
]

export function currentWeekIndex(
  startDate: number | null,
  now: number = Date.now(),
): number {
  if (!startDate) return 0
  const weeks = Math.floor((now - startDate) / (7 * 86_400_000))
  return Math.max(0, Math.min(CURRICULUM.length - 1, weeks))
}
