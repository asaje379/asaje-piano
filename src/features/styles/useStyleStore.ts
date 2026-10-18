import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AccompanimentPattern } from '@/services/backing'
import { idbStorage } from '@/services/idbStorage'
import { styleOfTheDayId } from '@/data/styles'

interface StyleState {
  styleId: string
  pattern: AccompanimentPattern
  setStyleId: (id: string) => void
  setPattern: (pattern: AccompanimentPattern) => void
}

export const useStyleStore = create<StyleState>()(
  persist(
    (set) => ({
      styleId: styleOfTheDayId(),
      pattern: 'block',
      setStyleId: (styleId) => set({ styleId }),
      setPattern: (pattern) => set({ pattern }),
    }),
    { name: 'asaje-styles', storage: createJSONStorage(() => idbStorage) },
  ),
)
