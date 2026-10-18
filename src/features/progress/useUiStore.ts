import { create } from 'zustand'

interface UiState {
  tab: string
  setTab: (tab: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  tab: 'today',
  setTab: (tab) => set({ tab }),
}))
