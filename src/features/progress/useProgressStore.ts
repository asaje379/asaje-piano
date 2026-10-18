import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { idbStorage } from '@/services/idbStorage'

export interface DayLog {
  items: string[]
  updatedAt: number
}

export interface SessionItem {
  id: string
  label: string
  hint: string
}

export const SESSION_ITEMS: SessionItem[] = [
  {
    id: 'style',
    label: 'Style du jour',
    hint: 'Ouvrir le module Gammes & impro',
  },
  {
    id: 'arpege',
    label: 'Arpège du style',
    hint: 'Générer l’accompagnement et jouer dessus',
  },
  {
    id: 'progression',
    label: 'Progression + voice leading',
    hint: '3 progressions, toutes les tonalités',
  },
  {
    id: 'lecture',
    label: 'Lecture',
    hint: 'Un exercice de déchiffrage ou de lecture à vue',
  },
]

interface ProgressState {
  days: Record<string, DayLog>
  startDate: number | null
  toggleItem: (date: string, item: string) => void
  clearDay: (date: string) => void
  setStartDate: (value: number | null) => void
  reset: () => void
}

export function todayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      days: {},
      startDate: null,
      toggleItem: (date, item) =>
        set((state) => {
          const current = state.days[date]?.items ?? []
          const items = current.includes(item)
            ? current.filter((value) => value !== item)
            : [...current, item]
          return {
            days: {
              ...state.days,
              [date]: { items, updatedAt: Date.now() },
            },
          }
        }),
      clearDay: (date) =>
        set((state) => ({
          days: { ...state.days, [date]: { items: [], updatedAt: Date.now() } },
        })),
      setStartDate: (startDate) => set({ startDate }),
      reset: () => set({ days: {} }),
    }),
    { name: 'asaje-progress', storage: createJSONStorage(() => idbStorage) },
  ),
)

export function computeStreak(
  days: Record<string, DayLog>,
  today: Date = new Date(),
): number {
  const cursor = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  )
  let key = todayKey(cursor)
  if (!days[key]?.items.length) {
    cursor.setUTCDate(cursor.getUTCDate() - 1)
    key = todayKey(cursor)
  }
  let streak = 0
  while (days[key]?.items.length) {
    streak += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
    key = todayKey(cursor)
  }
  return streak
}
