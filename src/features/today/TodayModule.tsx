import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader, Panel } from '@/components/layout/Module'
import { CURRICULUM, currentWeekIndex } from '@/data/curriculum'
import { getStyle, styleOfTheDayId } from '@/data/styles'
import { usePracticeStore } from '@/features/progressions/usePracticeStore'
import { useStyleStore } from '@/features/styles/useStyleStore'
import { useUiStore } from '@/features/progress/useUiStore'
import {
  computeStreak,
  todayKey,
  useProgressStore,
  SESSION_ITEMS,
} from '@/features/progress/useProgressStore'
import { cn } from 'cn'

export function TodayModule() {
  const styleId = useStyleStore((state) => state.styleId)
  const setTab = useUiStore((state) => state.setTab)

  const key = usePracticeStore((state) => state.key)
  const mode = usePracticeStore((state) => state.mode)
  const roman = usePracticeStore((state) => state.romanProgression)

  const days = useProgressStore((state) => state.days)
  const startDate = useProgressStore((state) => state.startDate)
  const toggleItem = useProgressStore((state) => state.toggleItem)

  const today = todayKey()
  const doneToday = days[today]?.items ?? []
  const streak = computeStreak(days)

  const style = getStyle(styleId)
  const week = CURRICULUM[currentWeekIndex(startDate)]
  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <>
      <PageHeader
        title="Aujourd’hui"
        description={dateLabel}
        actions={
          streak > 0 ? (
            <Badge>
              {streak} jour{streak > 1 ? 's' : ''} d’affilée
            </Badge>
          ) : null
        }
      />

      {week ? (
        <p className="text-sm text-muted-foreground">
          Parcours · Semaine {week.week}/{CURRICULUM.length} — {week.focus}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Panel
          title="Style du jour"
          description={
            styleId === styleOfTheDayId() ? 'aujourd’hui' : 'sélectionné'
          }
        >
          <p className="text-lg font-semibold">{style?.label ?? styleId}</p>
          <p className="text-xs text-muted-foreground">{style?.description}</p>
          <Button
            className="mt-1 self-start"
            size="sm"
            onClick={() => setTab('gammes')}
          >
            Ouvrir
          </Button>
        </Panel>

        <Panel title="Progression" description="à travailler">
          <p className="text-lg font-semibold">
            {key} {mode === 'major' ? 'majeur' : 'mineur'}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {roman.join(' - ')}
          </p>
          <Button
            className="mt-1 self-start"
            size="sm"
            onClick={() => setTab('progressions')}
          >
            Travailler
          </Button>
        </Panel>

        <Panel title="Lecture" description={week?.reading ?? 'déchiffrage'}>
          <p className="text-lg font-semibold">{week?.reading ?? 'Exercice'}</p>
          <p className="text-xs text-muted-foreground">
            Déchiffrage clé de sol / fa
          </p>
          <Button
            className="mt-1 self-start"
            size="sm"
            onClick={() => setTab('lecture')}
          >
            Ouvrir
          </Button>
        </Panel>
      </div>

      <Panel
        title="Séance du jour"
        description="Coche chaque étape : c’est ce qui entretient la série."
      >
        <div className="flex flex-col gap-2">
          {SESSION_ITEMS.map((item) => {
            const done = doneToday.includes(item.id)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(today, item.id)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                  done
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-border hover:bg-accent',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border text-xs',
                    done
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/40',
                  )}
                  aria-hidden
                >
                  {done ? '✓' : ''}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.hint}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {doneToday.length}/{SESSION_ITEMS.length} étapes faites aujourd’hui.
        </p>
      </Panel>
    </>
  )
}
