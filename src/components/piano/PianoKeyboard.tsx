import { useState } from 'react'
import { cn } from 'cn'
import { midiToLabel, midiToName } from '@/core/pitch'

export type NoteHighlight = 'target' | 'common' | 'half'

interface PianoKeyboardProps {
  startOctave?: number
  octaves?: number
  highlights?: Partial<Record<number, NoteHighlight>>
  activeMidis?: number[]
  onNoteOn?: (midi: number) => void
  onNoteOff?: (midi: number) => void
  showLabels?: boolean
  className?: string
}

const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11]
const BLACK_KEYS = [
  { afterWhite: 0, pc: 1 },
  { afterWhite: 1, pc: 3 },
  { afterWhite: 3, pc: 6 },
  { afterWhite: 4, pc: 8 },
  { afterWhite: 5, pc: 10 },
] as const

const HL_CLASS: Record<NoteHighlight, string> = {
  target: 'bg-hl-target',
  common: 'bg-hl-common',
  half: 'bg-hl-half',
}

export function PianoKeyboard({
  startOctave = 3,
  octaves = 3,
  highlights = {},
  activeMidis = [],
  onNoteOn,
  onNoteOff,
  showLabels = true,
  className,
}: PianoKeyboardProps) {
  const [pressed, setPressed] = useState<ReadonlySet<number>>(new Set())
  const active = new Set(activeMidis)
  const startMidi = (startOctave + 1) * 12
  const totalWhites = octaves * 7

  const press = (midi: number) => {
    setPressed((prev) => new Set(prev).add(midi))
    onNoteOn?.(midi)
  }

  const release = (midi: number) => {
    setPressed((prev) => {
      if (!prev.has(midi)) return prev
      const next = new Set(prev)
      next.delete(midi)
      return next
    })
    onNoteOff?.(midi)
  }

  const whiteMidis = Array.from({ length: totalWhites }, (_, i) => {
    const octave = Math.floor(i / 7)
    return startMidi + octave * 12 + WHITE_PCS[i % 7]
  })

  const blackKeys = Array.from({ length: octaves }, (_, o) =>
    BLACK_KEYS.map((bk) => ({
      midi: startMidi + o * 12 + bk.pc,
      afterWhite: o * 7 + bk.afterWhite,
    })),
  ).flat()

  const keyWidthPct = 100 / totalWhites

  const keyClass = (midi: number, isBlack: boolean) => {
    const isPressed = pressed.has(midi) || active.has(midi)
    const highlight = highlights[midi]
    if (isPressed) {
      return 'bg-key-pressed text-white'
    }
    if (highlight) {
      return cn(HL_CLASS[highlight], 'text-white')
    }
    return isBlack
      ? 'bg-key-black text-white/80'
      : 'bg-key-white text-muted-foreground'
  }

  return (
    <div
      className={cn('relative h-44 w-full select-none', className)}
      role="group"
      aria-label="Clavier de piano"
    >
      <div className="flex h-full w-full">
        {whiteMidis.map((midi) => (
          <button
            key={midi}
            type="button"
            aria-label={midiToLabel(midi)}
            onPointerDown={() => press(midi)}
            onPointerUp={() => release(midi)}
            onPointerLeave={() => release(midi)}
            onPointerCancel={() => release(midi)}
            className={cn(
              'relative flex h-full flex-1 items-end justify-center rounded-b-sm border border-key-white-border pb-2 text-[10px] font-medium transition-colors',
              keyClass(midi, false),
            )}
          >
            {showLabels ? midiToName(midi) : null}
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0">
        {blackKeys.map(({ midi, afterWhite }) => (
          <button
            key={midi}
            type="button"
            aria-label={midiToLabel(midi)}
            onPointerDown={() => press(midi)}
            onPointerUp={() => release(midi)}
            onPointerLeave={() => release(midi)}
            onPointerCancel={() => release(midi)}
            style={{
              left: `${(afterWhite + 0.7) * keyWidthPct}%`,
              width: `${0.6 * keyWidthPct}%`,
            }}
            className={cn(
              'pointer-events-auto absolute top-0 h-[60%] rounded-b-md border border-black/60 shadow-sm transition-colors',
              keyClass(midi, true),
            )}
          />
        ))}
      </div>
    </div>
  )
}
