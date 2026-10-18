import { useMemo } from 'react'
import { midisToVexKeys, StaffScore, type StaffScoreNote } from './StaffScore'

interface StaffViewProps {
  chords: number[][]
  className?: string
}

export function StaffView({ chords, className }: StaffViewProps) {
  const notes = useMemo<StaffScoreNote[]>(
    () =>
      chords.map((midis) => ({
        keys: midisToVexKeys(midis),
        duration: 'q' as const,
      })),
    [chords],
  )

  return <StaffScore clef="treble" notes={notes} className={className} />
}
