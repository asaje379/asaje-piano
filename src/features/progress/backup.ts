import type { Mode } from '@/core/progressions'
import type { Hands } from '@/core/voicing'
import {
  usePracticeStore,
  type ScoreEntry,
} from '@/features/progressions/usePracticeStore'
import { useStyleStore } from '@/features/styles/useStyleStore'
import type { AccompanimentPattern } from '@/services/backing'
import { todayKey, useProgressStore, type DayLog } from './useProgressStore'

const VERSION = 1

interface PracticeData {
  key: string
  mode: Mode
  hands: Hands
  startInversion: number
  tempo: number
  metronome: boolean
  history: ScoreEntry[]
}

interface StylesData {
  styleId: string
  pattern: AccompanimentPattern
}

interface ProgressData {
  days: Record<string, DayLog>
}

export interface Backup {
  version: number
  exportedAt: number
  practice: PracticeData
  styles: StylesData
  progress: ProgressData
}

export function buildBackup(): Backup {
  const practice = usePracticeStore.getState()
  const styles = useStyleStore.getState()
  const progress = useProgressStore.getState()
  return {
    version: VERSION,
    exportedAt: Date.now(),
    practice: {
      key: practice.key,
      mode: practice.mode,
      hands: practice.hands,
      startInversion: practice.startInversion,
      tempo: practice.tempo,
      metronome: practice.metronome,
      history: practice.history,
    },
    styles: { styleId: styles.styleId, pattern: styles.pattern },
    progress: { days: progress.days },
  }
}

export function downloadBackup(): void {
  const data = JSON.stringify(buildBackup(), null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `asaje-sauvegarde-${todayKey()}.json`
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function importBackup(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as Partial<Backup>
    if (parsed.practice) {
      usePracticeStore.setState(parsed.practice)
    }
    if (parsed.styles) {
      useStyleStore.setState(parsed.styles)
    }
    if (parsed.progress) {
      useProgressStore.setState(parsed.progress)
    }
    return true
  } catch {
    return false
  }
}
