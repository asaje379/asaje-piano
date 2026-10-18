/**
 * Les 90 progressions du "30-Day Piano Triad Progression Challenge".
 * Chaque entrée = les 3 progressions d'une journée, en degrés romains.
 */
export const CHALLENGE: string[][] = [
  ['I - IV - V - I', 'I - V - vi - IV', 'ii - V - I'],
  ['I - vi - IV - V', 'vi - IV - I - V', 'I - iii - IV - V'],
  ['I - IV - vi - V', 'vi - V - IV - I', 'ii - vi - V - I'],
  ['I - V - IV - I', 'vi - ii - IV - V', 'I - iii - vi - IV'],
  ['I - ii - IV - V', 'I - vi - ii - V', 'iii - vi - ii - V'],
  ['I - IV - ii - V', 'vi - IV - ii - V', 'I - V - ii - IV'],
  ['I - IV - I - V', 'I - vi - iii - IV', 'vi - iii - IV - V'],
  ['I - V - iii - IV', 'I - iii - ii - V', 'vi - IV - ii - V'],
  ['I - ii - iii - IV', 'IV - V - iii - vi', 'vi - V - ii - I'],
  ['I - IV - V - vi', 'I - iii - IV - vi', 'ii - IV - V - I'],
  ['I - V - IV - vi', 'vi - iii - IV - I', 'IV - ii - V - I'],
  ['I - ii - vi - IV', 'I - V - ii - vi', 'iii - IV - ii - V'],
  ['vi - IV - V - I', 'I - iii - vi - V', 'ii - V - vi - IV'],
  ['I - IV - iii - vi', 'I - vi - IV - ii', 'V - vi - IV - I'],
  ['I - ii - V - vi', 'vi - ii - V - I', 'IV - V - vi - I'],
  ['I - iii - IV - ii', 'I - V - vi - iii', 'vi - V - iii - IV'],
  ['I - IV - ii - vi', 'iii - vi - IV - I', 'ii - iii - IV - V'],
  ['I - vi - iii - ii', 'IV - I - V - vi', 'V - IV - I - vi'],
  ['I - IV - V - iii', 'vi - I - IV - V', 'ii - IV - I - V'],
  ['I - iii - vi - ii', 'IV - vi - ii - V', 'V - iii - IV - I'],
  ['vi - ii - I - V', 'I - V - IV - ii', 'iii - IV - I - V'],
  ['I - ii - IV - vi', 'vi - IV - iii - V', 'V - vi - ii - I'],
  ['I - vi - V - IV', 'IV - I - vi - V', 'ii - I - V - IV'],
  ['I - iii - IV - V - I', 'I - V - vi - IV - I', 'ii - V - I - vi - IV'],
  ['I - IV - ii - V - I', 'vi - ii - V - I - IV', 'I - vi - ii - V - I'],
  ['I - V - vi - iii - IV', 'vi - IV - I - V - iii', 'I - iii - vi - IV - V'],
  ['I - IV - V - vi - IV', 'vi - V - IV - I - V', 'I - vi - IV - ii - V'],
  ['I - iii - vi - IV - V', 'IV - V - iii - vi - ii', 'ii - V - I - IV - vi'],
  ['I - vi - IV - V - I', 'vi - iii - IV - I - V', 'I - V - ii - IV - I'],
  ['I - vi - ii - V - I', 'I - IV - ii - V - I', 'I - V - vi - IV - I'],
]

export interface ChallengeEntry {
  day: number
  roman: string
}

export function allChallengeProgressions(): ChallengeEntry[] {
  return CHALLENGE.flatMap((day, index) =>
    day.map((roman) => ({ day: index + 1, roman })),
  )
}
