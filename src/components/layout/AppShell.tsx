import {
  BarChart3,
  BookOpen,
  ListMusic,
  Moon,
  Music,
  Sparkles,
  Sun,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from 'cn'
import { useUiStore } from '@/features/progress/useUiStore'

const NAV = [
  { id: 'today', label: 'Aujourd’hui', Icon: Sparkles },
  { id: 'progressions', label: 'Progressions', Icon: ListMusic },
  { id: 'gammes', label: 'Gammes & impro', Icon: Music },
  { id: 'lecture', label: 'Lecture', Icon: BookOpen },
  { id: 'suivi', label: 'Suivi', Icon: BarChart3 },
] as const

function useTheme() {
  const [dark, setDark] = useState(true)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  return { dark, toggle: () => setDark((value) => !value) }
}

function Nav() {
  const tab = useUiStore((state) => state.tab)
  const setTab = useUiStore((state) => state.setTab)
  return (
    <nav className="flex items-center gap-1 overflow-x-auto lg:flex-col lg:items-stretch lg:gap-1">
      {NAV.map(({ id, label, Icon }) => {
        const active = tab === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-svh bg-background lg:flex">
      <aside className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur lg:flex lg:h-svh lg:w-60 lg:shrink-0 lg:flex-col lg:gap-4 lg:border-b-0 lg:border-r lg:bg-background lg:p-4">
        <div className="flex items-center gap-2 px-4 py-3 lg:px-1 lg:py-0">
          <span className="text-lg font-semibold tracking-tight">
            Asaje Piano
          </span>
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? 'Passer en clair' : 'Passer en sombre'}
            className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
        <div className="px-3 pb-3 lg:px-0 lg:pb-0">
          <Nav />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
