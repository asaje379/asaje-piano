import { useEffect, useRef } from 'react'
import {
  Accidental,
  Formatter,
  Renderer,
  Stave,
  StaveNote,
  Voice,
} from 'vexflow'
import { midiToLabel } from '@/core/pitch'
import { durationBeats, type Clef, type Duration } from '@/core/reading'

export interface StaffScoreNote {
  keys: string[]
  duration: Duration
}

export function midiToVexKey(midi: number): string {
  const label = midiToLabel(midi)
  const letter = label[0]?.toLowerCase() ?? 'c'
  const rest = label.slice(1)
  const accidental = rest.startsWith('#') ? '#' : ''
  const octave = accidental ? rest.slice(1) : rest
  return `${letter}${accidental}/${octave}`
}

export function midisToVexKeys(midis: number[]): string[] {
  return [...midis].sort((a, b) => a - b).map(midiToVexKey)
}

interface StaffScoreProps {
  clef: Clef
  notes: StaffScoreNote[]
  timeSignature?: string
  keySignature?: string
  className?: string
}

export function StaffScore({
  clef,
  notes,
  timeSignature,
  keySignature,
  className,
}: StaffScoreProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const draw = () => {
      element.innerHTML = ''
      const width = Math.max(element.clientWidth || 600, 240)
      const renderer = new Renderer(element, Renderer.Backends.SVG)
      renderer.resize(width, 150)
      const context = renderer.getContext()
      const color = getComputedStyle(element).color || '#000000'
      context.setFillStyle(color)
      context.setStrokeStyle(color)
      const stave = new Stave(8, 30, width - 16)
      stave.addClef(clef)
      if (keySignature) stave.addKeySignature(keySignature)
      if (timeSignature) stave.addTimeSignature(timeSignature)
      stave.setContext(context).draw()

      if (notes.length === 0) return

      const staveNotes = notes.map((note) => {
        const staveNote = new StaveNote({
          keys: note.keys,
          duration: note.duration,
          clef,
        })
        note.keys.forEach((key, index) => {
          if (key.includes('#'))
            staveNote.addModifier(new Accidental('#'), index)
        })
        return staveNote
      })

      const totalBeats = notes.reduce(
        (sum, note) => sum + durationBeats(note.duration),
        0,
      )
      const voice = new Voice({
        numBeats: totalBeats,
        beatValue: 4,
      }).setMode(Voice.Mode.SOFT)
      voice.addTickables(staveNotes)
      new Formatter().joinVoices([voice]).format([voice], width - 80)
      voice.draw(context, stave)
    }

    draw()
    const resizeObserver = new ResizeObserver(draw)
    resizeObserver.observe(element)
    const themeObserver = new MutationObserver(draw)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => {
      resizeObserver.disconnect()
      themeObserver.disconnect()
    }
  }, [clef, notes, timeSignature, keySignature])

  return <div ref={containerRef} className={className} />
}
