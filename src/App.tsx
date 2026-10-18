import { AppShell } from '@/components/layout/AppShell'
import { ProgressionsModule } from '@/features/progressions/ProgressionsModule'
import { ProgressModule } from '@/features/progress/ProgressModule'
import { useUiStore } from '@/features/progress/useUiStore'
import { ReadingModule } from '@/features/reading/ReadingModule'
import { ScalesModule } from '@/features/scales/ScalesModule'
import { TodayModule } from '@/features/today/TodayModule'

function App() {
  const tab = useUiStore((state) => state.tab)

  return (
    <AppShell>
      {tab === 'today' ? <TodayModule /> : null}
      {tab === 'progressions' ? <ProgressionsModule /> : null}
      {tab === 'gammes' ? <ScalesModule /> : null}
      {tab === 'lecture' ? <ReadingModule /> : null}
      {tab === 'suivi' ? <ProgressModule /> : null}
    </AppShell>
  )
}

export default App
