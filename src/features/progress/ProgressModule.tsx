import { useMemo, useRef, useState } from 'react'
import { cn } from 'cn'
import { PageHeader, Panel } from '@/components/layout/Module'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { parseProgressionString } from '@/core/progressions'
import { CURRICULUM, currentWeekIndex } from '@/data/curriculum'
import { getStyle } from '@/data/styles'
import { usePracticeStore } from '@/features/progressions/usePracticeStore'
import { useStyleStore } from '@/features/styles/useStyleStore'
import { downloadBackup, importBackup } from './backup'
import { useUiStore } from './useUiStore'
import { computeStreak, useProgressStore } from './useProgressStore'

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  })
}

export function ProgressModule() {
  const history = usePracticeStore((state) => state.history)
  const clearHistory = usePracticeStore((state) => state.clearHistory)
  const setKey = usePracticeStore((state) => state.setKey)
  const setMode = usePracticeStore((state) => state.setMode)
  const setRomanProgression = usePracticeStore(
    (state) => state.setRomanProgression,
  )
  const setStyleId = useStyleStore((state) => state.setStyleId)
  const setTab = useUiStore((state) => state.setTab)

  const days = useProgressStore((state) => state.days)
  const startDate = useProgressStore((state) => state.startDate)
  const setStartDate = useProgressStore((state) => state.setStartDate)

  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  const streak = computeStreak(days)
  const weekIndex = currentWeekIndex(startDate)

  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        sessions: 0,
        average: 0,
        progressions: 0,
        lastDate: null as number | null,
      }
    }
    const total = history.reduce((sum, entry) => sum + entry.score, 0)
    const progressions = new Set(
      history.map((entry) => `${entry.key}:${entry.progression}`),
    )
    return {
      sessions: history.length,
      average: total / history.length,
      progressions: progressions.size,
      lastDate: Math.max(...history.map((entry) => entry.date)),
    }
  }, [history])

  const weak = useMemo(() => {
    const map = new Map<
      string,
      { sum: number; count: number; entry: (typeof history)[number] }
    >()
    for (const entry of history) {
      const label = `${entry.key} ${entry.mode === 'major' ? 'maj' : 'min'} · ${entry.progression}`
      const current = map.get(label) ?? { sum: 0, count: 0, entry }
      current.sum += entry.score
      current.count += 1
      current.entry = entry
      map.set(label, current)
    }
    return [...map.entries()]
      .map(([label, value]) => ({
        label,
        average: value.sum / value.count,
        count: value.count,
        entry: value.entry,
      }))
      .filter((value) => value.average <= 3)
      .sort((a, b) => a.average - b.average)
      .slice(0, 6)
  }, [history])

  const handleImport = async (file: File | undefined) => {
    if (!file) return
    const text = await file.text()
    const ok = importBackup(text)
    setMessage(ok ? 'Sauvegarde importée.' : 'Fichier invalide.')
  }

  const review = (entry: (typeof history)[number]) => {
    setKey(entry.key)
    setMode(entry.mode)
    setRomanProgression(parseProgressionString(entry.progression))
    setTab('progressions')
  }

  const openWeek = (index: number) => {
    const week = CURRICULUM[index]
    if (!week) return
    setStyleId(week.style)
    setRomanProgression(parseProgressionString(week.progression))
  }

  return (
    <>
      <PageHeader
        title="Suivi"
        description="Ta régularité et tes points à retravailler."
        actions={
          <>
            {streak > 0 ? (
              <Badge>
                {streak} jour{streak > 1 ? 's' : ''} d’affilée
              </Badge>
            ) : null}
            <Button variant="outline" type="button" onClick={downloadBackup}>
              Exporter
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => fileRef.current?.click()}
            >
              Importer
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                void handleImport(event.target.files?.[0])
                event.target.value = ''
              }}
            />
          </>
        }
      />

      <Panel title="Statistiques">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{stats.sessions} sessions</Badge>
          <Badge variant="secondary">
            Score moyen : {stats.average.toFixed(1)}/5
          </Badge>
          <Badge variant="secondary">
            {stats.progressions} progressions travaillées
          </Badge>
          {stats.lastDate ? (
            <Badge variant="outline">
              Dernière : {formatDate(stats.lastDate)}
            </Badge>
          ) : null}
        </div>
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}
      </Panel>

      <Panel
        title="Parcours guidé"
        description="Six semaines pour ouvrir les styles un par un, sans remplacer."
      >
        <div className="flex flex-wrap items-center gap-3">
          {startDate ? (
            <>
              <span className="text-sm text-muted-foreground">
                Semaine {weekIndex + 1}/{CURRICULUM.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setStartDate(null)}
              >
                Arrêter
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => setStartDate(Date.now())}>
              Démarrer le parcours
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {CURRICULUM.map((week, index) => {
            const isCurrent = startDate !== null && index === weekIndex
            const style = getStyle(week.style)
            return (
              <div
                key={week.week}
                className={cn(
                  'flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2',
                  isCurrent
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-border',
                )}
              >
                <Badge variant={isCurrent ? 'default' : 'outline'}>
                  S{week.week}
                </Badge>
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-medium">
                    {style?.label ?? week.style} · {week.focus}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {week.progression} · {week.arpeggio} · {week.reading}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    openWeek(index)
                    setTab('gammes')
                  }}
                >
                  Gammes
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    openWeek(index)
                    setTab('progressions')
                  }}
                >
                  Progressions
                </Button>
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel
        title="Révision (répétition espacée)"
        description="Les progressions au score faible, prêtes à rejouer."
      >
        {weak.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Rien pour l’instant : sois fier.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {weak.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <Badge variant="outline">
                  {item.average.toFixed(1)}/5 · {item.count}×
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => review(item.entry)}
                >
                  Revoir
                </Button>
              </li>
            ))}
          </ul>
        )}
        {history.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            type="button"
            onClick={clearHistory}
          >
            Effacer l’historique
          </Button>
        ) : null}
      </Panel>
    </>
  )
}
