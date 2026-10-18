import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MidiStatus } from '@/components/midi/MidiStatus'
import { ControlBar, PageHeader, Panel } from '@/components/layout/Module'
import { StaffView } from '@/components/notation/StaffView'
import { DegreeStrip } from '@/components/piano/DegreeStrip'
import {
  PianoKeyboard,
  type NoteHighlight,
} from '@/components/piano/PianoKeyboard'
import { VoiceLeadingTable } from '@/components/piano/VoiceLeadingTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { midiToLabel, NOTE_NAMES } from '@/core/pitch'
import {
  buildProgression,
  KEY_TONICS,
  parseProgressionString,
  randomRomanProgression,
  type Mode,
} from '@/core/progressions'
import {
  REGISTERS,
  solveProgression,
  voicingWithInversion,
  type Hands,
} from '@/core/voicing'
import { allChallengeProgressions } from '@/data/challenge'
import { useMidi } from '@/hooks/useMidi'
import { noteOff, noteOn } from '@/services/audio'
import {
  playProgression,
  startMetronome,
  stopMetronome,
} from '@/services/player'
import { detectChord, matchesExpected } from './detection'
import { usePracticeStore } from './usePracticeStore'

const CHALLENGE_OPTIONS = allChallengeProgressions().map((entry) => ({
  id: `${entry.day}::${entry.roman}`,
  label: `Jour ${entry.day} · ${entry.roman}`,
}))

const INVERSION_OPTIONS = [
  { value: '0', label: 'Fondamental' },
  { value: '1', label: '1er renversement' },
  { value: '2', label: '2e renversement' },
]

type RunState = 'idle' | 'running' | 'done'

export function ProgressionsModule() {
  const {
    key,
    mode,
    hands,
    startInversion,
    tempo,
    metronome,
    romanProgression,
    history,
    setKey,
    setMode,
    setHands,
    setStartInversion,
    setTempo,
    setMetronome,
    setRomanProgression,
    addScore,
  } = usePracticeStore()

  const roman = romanProgression
  const [selectionId, setSelectionId] = useState<string>(
    CHALLENGE_OPTIONS[1]?.id ?? 'random',
  )

  const chords = useMemo(
    () => buildProgression(roman, key, mode),
    [roman, key, mode],
  )

  const startVoicing = useMemo(() => {
    if (chords.length === 0) return []
    const baseOctave = hands === 'left' ? 3 : 4
    return voicingWithInversion(chords[0]!, startInversion, baseOctave)
  }, [chords, hands, startInversion])

  const steps = useMemo(
    () => solveProgression(chords, startVoicing, REGISTERS[hands]),
    [chords, startVoicing, hands],
  )
  const expectedVoicings = useMemo(
    () => steps.map((step) => step.voicing.midis),
    [steps],
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [runState, setRunState] = useState<RunState>('idle')
  const [held, setHeld] = useState<ReadonlySet<number>>(new Set())
  const [feedback, setFeedback] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [lastSeconds, setLastSeconds] = useState<number | null>(null)
  const startRef = useRef(0)
  const awaitingReleaseRef = useRef(false)

  const resetSession = useCallback(() => {
    setRunState('idle')
    setCurrentIndex(0)
    setElapsed(0)
    setFeedback(null)
    setLastSeconds(null)
    awaitingReleaseRef.current = false
  }, [])

  useEffect(() => {
    resetSession()
  }, [roman, key, mode, hands, startInversion, resetSession])

  useEffect(() => {
    if (runState !== 'running') return
    const id = setInterval(
      () => setElapsed((Date.now() - startRef.current) / 1000),
      100,
    )
    return () => clearInterval(id)
  }, [runState])

  useEffect(() => {
    if (held.size === 0) awaitingReleaseRef.current = false
  }, [held])

  useEffect(() => {
    if (metronome) void startMetronome(tempo)
    else void stopMetronome()
    return () => {
      void stopMetronome()
    }
  }, [metronome, tempo])

  const handleNoteOn = useCallback((midi: number) => {
    setHeld((prev) => new Set(prev).add(midi))
    void noteOn(midi)
  }, [])

  const handleNoteOff = useCallback((midi: number) => {
    setHeld((prev) => {
      if (!prev.has(midi)) return prev
      const next = new Set(prev)
      next.delete(midi)
      return next
    })
    void noteOff(midi)
  }, [])

  const midi = useMidi((event, kind) => {
    if (kind === 'on') handleNoteOn(event.midi)
    else handleNoteOff(event.midi)
  })

  const detected = useMemo(() => detectChord([...held]), [held])

  useEffect(() => {
    if (runState !== 'running') return
    if (awaitingReleaseRef.current) return
    const step = steps[currentIndex]
    if (!step) return
    const ok = matchesExpected(detected, {
      rootPc: step.chord.rootPc,
      quality: step.chord.quality,
      inversion: step.voicing.inversion,
    })
    if (!ok) return
    awaitingReleaseRef.current = true
    if (currentIndex < steps.length - 1) {
      setCurrentIndex((index) => index + 1)
      setFeedback('Accord correct — continue.')
    } else {
      const seconds = (Date.now() - startRef.current) / 1000
      setLastSeconds(seconds)
      setRunState('done')
      setFeedback('Progression terminée ! Note ton ressenti.')
    }
  }, [detected, runState, currentIndex, steps])

  const start = useCallback(() => {
    startRef.current = Date.now()
    setElapsed(0)
    setCurrentIndex(0)
    setRunState('running')
    setFeedback('Joue l’accord surligné, du grave vers l’aigu.')
    awaitingReleaseRef.current = false
  }, [])

  const handleSelection = (value: string) => {
    setSelectionId(value)
    if (value === 'random') {
      setRomanProgression(randomRomanProgression(4, mode))
      return
    }
    const romanString = value.split('::')[1]
    if (romanString) setRomanProgression(parseProgressionString(romanString))
  }

  const highlights = useMemo(() => {
    const map: Record<number, NoteHighlight> = {}
    const step = steps[currentIndex]
    if (runState !== 'done' && step) {
      for (const midiNote of step.voicing.midis) map[midiNote] = 'target'
    }
    return map
  }, [steps, currentIndex, runState])

  const expectedStep = steps[currentIndex]
  const nextStep = steps[Math.min(currentIndex + 1, steps.length - 1)]
  const transition = nextStep?.fromPrevious ?? null

  const saveScore = (score: number) => {
    if (lastSeconds === null) return
    addScore({
      id: crypto.randomUUID(),
      date: Date.now(),
      key,
      mode,
      progression: roman.join(' - '),
      seconds: lastSeconds,
      score,
    })
    resetSession()
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Progressions & voice leading"
        description="Trouve l’enchaînement qui bouge le moins, puis joue-le."
        actions={
          <MidiStatus
            status={midi.status}
            devices={midi.devices}
            error={midi.error}
            onConnect={() => void midi.connect()}
          />
        }
      />

      <Panel title="Réglages">
        <ControlBar>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Tonalité
            <Select value={key} onValueChange={setKey}>
              <SelectTrigger className="w-24" aria-label="Tonalité">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KEY_TONICS.map((tonic) => (
                  <SelectItem key={tonic} value={tonic}>
                    {tonic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Mode
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <TabsList>
                <TabsTrigger value="major">Majeur</TabsTrigger>
                <TabsTrigger value="minor">Mineur</TabsTrigger>
              </TabsList>
            </Tabs>
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Mains
            <Tabs value={hands} onValueChange={(v) => setHands(v as Hands)}>
              <TabsList>
                <TabsTrigger value="left">Gauche</TabsTrigger>
                <TabsTrigger value="both">Deux</TabsTrigger>
                <TabsTrigger value="right">Droite</TabsTrigger>
              </TabsList>
            </Tabs>
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Renversement de départ
            <Select
              value={String(startInversion)}
              onValueChange={(v) => setStartInversion(Number(v))}
            >
              <SelectTrigger
                className="w-48"
                aria-label="Renversement de départ"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVERSION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs text-muted-foreground">
            Progression
            <Select value={selectionId} onValueChange={handleSelection}>
              <SelectTrigger className="w-full" aria-label="Progression">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="random">Aléatoire (4 accords)</SelectItem>
                {CHALLENGE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </ControlBar>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex min-w-52 flex-1 flex-col gap-1 text-xs text-muted-foreground">
            Tempo · {tempo} BPM
            <Slider
              value={[tempo]}
              min={50}
              max={160}
              step={2}
              onValueChange={([value]) => setTempo(value ?? tempo)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={metronome} onCheckedChange={setMetronome} />
            Métronome
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={() => void playProgression(expectedVoicings, tempo)}
          >
            Écouter le résultat
          </Button>
          <Button type="button" onClick={start}>
            {runState === 'running' ? 'Recommencer' : 'Démarrer'}
          </Button>
        </div>
      </Panel>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progression du jour</CardTitle>
          {runState === 'running' ? (
            <CardDescription>
              Temps : {elapsed.toFixed(1)} s · étape {currentIndex + 1}/
              {steps.length}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <DegreeStrip
            chords={chords}
            currentIndex={currentIndex}
            onSelect={(index) => setCurrentIndex(index)}
          />

          <StaffView chords={expectedVoicings} className="rounded-lg bg-card" />

          <PianoKeyboard
            startOctave={2}
            octaves={4}
            highlights={highlights}
            activeMidis={[...held]}
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
          />

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted-foreground">Attendu :</span>
            <Badge variant="secondary">
              {expectedStep?.chord.symbol}{' '}
              {expectedStep?.voicing.midis
                .map((m) => midiToLabel(m))
                .join(' · ')}
            </Badge>
            <span className="text-muted-foreground">Joué :</span>
            <Badge variant={detected ? 'default' : 'outline'}>
              {detected
                ? `${detected.symbol} · ${detected.midis
                    .map((m) => midiToLabel(m))
                    .join(' · ')}`
                : '—'}
            </Badge>
          </div>

          {feedback ? (
            <p
              className={
                runState === 'done'
                  ? 'text-sm font-medium text-hl-common'
                  : 'text-sm text-muted-foreground'
              }
            >
              {feedback}
            </p>
          ) : null}

          {runState === 'done' && lastSeconds !== null ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm">
                Terminé en <strong>{lastSeconds.toFixed(1)} s</strong> — comment
                l’as-tu senti ?
              </span>
              {[1, 2, 3, 4, 5].map((score) => (
                <Button
                  key={score}
                  size="sm"
                  variant="outline"
                  onClick={() => saveScore(score)}
                >
                  {score}
                </Button>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Analyse du voice leading
            </CardTitle>
            <CardDescription>
              Le choix retenu bouge le moins possible et garde les notes
              communes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VoiceLeadingTable steps={steps} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enchaînement courant</CardTitle>
            <CardDescription>
              {transition && expectedStep
                ? `Depuis ${steps[currentIndex - 1]?.chord.symbol ?? '—'} → ${expectedStep.chord.symbol}`
                : 'Premier accord'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {transition ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    Mouvement : {transition.cost} demi-tons
                  </Badge>
                  <Badge variant="secondary">
                    Notes communes :{' '}
                    {transition.commonTones.length > 0
                      ? transition.commonTones
                          .map((pc) => NOTE_NAMES[pc])
                          .join(', ')
                      : '—'}
                  </Badge>
                  <Badge variant="secondary">
                    ½ ton : {transition.halfSteps}
                  </Badge>
                  <Badge variant="secondary">
                    1 ton : {transition.wholeSteps}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Bouge chaque voix le moins possible : garde les notes
                  communes, déplace les autres d’un demi-ton ou d’un ton.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                C’est le point de départ — choisis un renversement, puis avance
                pour voir les enchaînements.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique</CardTitle>
          <CardDescription>
            Tes dernières progressions et leur ressenti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune session enregistrée pour l’instant.
            </p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {history.slice(0, 6).map((entry) => (
                <li key={entry.id} className="flex flex-wrap gap-2">
                  <span className="font-medium">
                    {entry.key} {entry.mode === 'major' ? 'maj' : 'min'}
                  </span>
                  <span className="text-muted-foreground">
                    {entry.progression}
                  </span>
                  <span className="ml-auto font-mono">
                    {entry.seconds.toFixed(1)} s · {entry.score}/5
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
