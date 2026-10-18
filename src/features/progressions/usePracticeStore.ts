import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { idbStorage } from '@/services/idbStorage'
import type { Mode } from '@/core/progressions'
import type { Hands } from '@/core/voicing'

export interface ScoreEntry {
  id: string
  date: number
  key: string
  mode: Mode
  progression: string
  seconds: number
  score: number
}

interface PracticeState {
  key: string
  mode: Mode
  hands: Hands
  startInversion: number
  tempo: number
  metronome: boolean
  romanProgression: string[]
  history: ScoreEntry[]
  setKey: (key: string) => void
  setMode: (mode: Mode) => void
  setHands: (hands: Hands) => void
  setStartInversion: (value: number) => void
  setTempo: (tempo: number) => void
  setMetronome: (value: boolean) => void
  setRomanProgression: (roman: string[]) => void
  addScore: (entry: ScoreEntry) => void
  clearHistory: () => void
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      key: 'C',
      mode: 'major',
      hands: 'both',
      startInversion: 0,
      tempo: 90,
      metronome: false,
      romanProgression: ['I', 'V', 'vi', 'IV'],
      history: [],
      setKey: (key) => set({ key }),
      setMode: (mode) => set({ mode }),
      setHands: (hands) => set({ hands }),
      setStartInversion: (startInversion) => set({ startInversion }),
      setTempo: (tempo) => set({ tempo }),
      setMetronome: (metronome) => set({ metronome }),
      setRomanProgression: (romanProgression) => set({ romanProgression }),
      addScore: (entry) =>
        set((state) => ({ history: [entry, ...state.history].slice(0, 100) })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'asaje-practice', storage: createJSONStorage(() => idbStorage) },
  ),
)
