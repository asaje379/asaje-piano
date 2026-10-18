import { cn } from 'cn'
import type { ChordSpec } from '@/core/chords'

interface DegreeStripProps {
  chords: ChordSpec[]
  currentIndex: number
  onSelect?: (index: number) => void
}

export function DegreeStrip({
  chords,
  currentIndex,
  onSelect,
}: DegreeStripProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {chords.map((chord, index) => {
        const active = index === currentIndex
        return (
          <button
            key={`${chord.degreeLabel}-${index}`}
            type="button"
            onClick={() => onSelect?.(index)}
            className={cn(
              'flex min-w-16 flex-col items-center rounded-lg border px-3 py-2 transition-colors',
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:bg-accent',
            )}
          >
            <span className="text-xs opacity-70">{chord.degreeLabel}</span>
            <span className="text-sm font-medium">{chord.symbol}</span>
          </button>
        )
      })}
    </div>
  )
}
