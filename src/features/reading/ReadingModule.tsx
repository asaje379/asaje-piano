import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  midiToVexKey,
  StaffScore,
  type StaffScoreNote,
} from '@/components/notation/StaffScore'
import { PianoKeyboard } from '@/components/piano/PianoKeyboard'
import { ControlBar, Field, PageHeader } from '@/components/layout/Module'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buildProgression } from '@/core/progressions'
import {
  durationBeats,
  intervalName,
  KEY_SIGNATURE_TONICS,
  keySignatureFor,
  noteName,
  noteNameOptions,
  pitchClassOf,
  randomIntervalForKey,
  randomMelody,
  randomMelodyForKey,
  randomNote,
  randomNoteForKey,
  randomTriad,
  samePitchClassSet,
  secondsPerBeat,
  vexKeyForKey,
  type Clef,
  type KeySignature,
  type Melody,
  type ReadingTriad,
} from '@/core/reading'
import { voicingWithInversion } from '@/core/voicing'
import { usePracticeStore } from '@/features/progressions/usePracticeStore'
import { useMidi } from '@/hooks/useMidi'
import { noteOff, noteOn, playChord } from '@/services/audio'
import { startMetronome, stopMetronome } from '@/services/player'

type Mode = 'name' | 'playNote' | 'playChord' | 'interval' | 'sightRead' | 'ear'
type ChordSource = 'random' | 'progression'

const MODE_LABELS: Record<Mode, string> = {
  name: 'Nommer la note',
  playNote: 'Jouer la note',
  playChord: 'Jouer l’accord',
  interval: 'Jouer l’intervalle',
  sightRead: 'Lecture à vue',
  ear: 'Oreille',
}

const KEY_MODES: Mode[] = ['playNote', 'playChord', 'interval', 'sightRead']
const COUNT_IN_BEATS = 4
const TIMING_TOLERANCE_MS = 80

function buildKeys(midis: number[], keySig: KeySignature | null): string[] {
  const sorted = [...midis].sort((a, b) => a - b)
  return keySig
    ? sorted.map((midi) => vexKeyForKey(midi, keySig))
    : sorted.map(midiToVexKey)
}

function StaffFromMidis({
  clef,
  groups,
  keySignature,
  timeSignature,
}: {
  clef: Clef
  groups: { midis: number[]; duration: StaffScoreNote['duration'] }[]
  keySignature?: KeySignature | null
  timeSignature?: string
}) {
  const notes = useMemo<StaffScoreNote[]>(
    () =>
      groups
        .filter((group) => group.midis.length > 0)
        .map((group) => ({
          keys: buildKeys(group.midis, keySignature ?? null),
          duration: group.duration,
        })),
    [groups, keySignature],
  )
  return (
    <StaffScore
      clef={clef}
      notes={notes}
      timeSignature={timeSignature}
      keySignature={keySignature?.label}
      className="rounded-lg bg-card"
    />
  )
}

interface SightResult {
  seconds: number
  mistakes: number
  averageOffset: number
  early: number
  late: number
}

export function ReadingModule() {
  const [mode, setMode] = useState<Mode>('name')
  const [clef, setClef] = useState<Clef>('treble')
  const [keyLabel, setKeyLabel] = useState('C')
  const [chordSource, setChordSource] = useState<ChordSource>('progression')

  const progKey = usePracticeStore((state) => state.key)
  const progMode = usePracticeStore((state) => state.mode)
  const progRoman = usePracticeStore((state) => state.romanProgression)
  const progChords = useMemo(
    () =>
      progRoman.length > 0
        ? buildProgression(progRoman, progKey, progMode)
        : [],
    [progRoman, progKey, progMode],
  )

  const [note, setNote] = useState(() => randomNote('treble'))
  const [options, setOptions] = useState<string[]>([])
  const [answered, setAnswered] = useState<string | null>(null)
  const [triad, setTriad] = useState<ReadingTriad>(() => randomTriad('treble'))
  const [chordLabel, setChordLabel] = useState('')
  const [interval, setInterval] = useState<number[]>(() => [60, 64])
  const [melody, setMelody] = useState<Melody>(() => randomMelody('treble', 5))

  const [held, setHeld] = useState<ReadonlySet<number>>(new Set())
  const [feedback, setFeedback] = useState<string | null>(null)
  const [session, setSession] = useState({ correct: 0, attempts: 0 })

  const [sightRunning, setSightRunning] = useState(false)
  const [sightIndex, setSightIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [sightResult, setSightResult] = useState<SightResult | null>(null)
  const [tempo, setTempo] = useState(80)

  const awaitingReleaseRef = useRef(false)
  const sightStartRef = useRef(0)
  const offsetsRef = useRef<number[]>([])
  const progIndexRef = useRef(0)
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const keySig = keySignatureFor(keyLabel)
  const progressionKeySig = keySignatureFor(progKey)

  const generate = useCallback(() => {
    setAnswered(null)
    setFeedback(null)
    setSightRunning(false)
    setSightIndex(0)
    setMistakes(0)
    setSightResult(null)
    offsetsRef.current = []
    awaitingReleaseRef.current = false

    if (mode === 'name' || mode === 'ear') {
      const n = randomNote(clef)
      setNote(n)
      setOptions(noteNameOptions(n, 4))
      return
    }
    if (mode === 'playNote') {
      setNote(randomNoteForKey(clef, keySig))
      return
    }
    if (mode === 'interval') {
      setInterval(randomIntervalForKey(clef, keySig))
      return
    }
    if (mode === 'sightRead') {
      setMelody(randomMelodyForKey(clef, keySig, 5))
      return
    }
    // playChord
    if (chordSource === 'progression' && progChords.length > 0) {
      const index = progIndexRef.current % progChords.length
      progIndexRef.current = index + 1
      const chord = progChords[index]
      if (chord) {
        const midis = voicingWithInversion(chord, 0, clef === 'bass' ? 3 : 4)
        setTriad({ rootPc: chord.rootPc, quality: chord.quality, midis })
        setChordLabel(`${chord.degreeLabel} · ${chord.symbol}`)
        return
      }
    }
    setChordLabel('')
    setTriad(randomTriad(clef))
  }, [mode, clef, keySig, chordSource, progChords])

  useEffect(() => {
    progIndexRef.current = 0
  }, [progRoman, progKey, progMode])

  useEffect(() => {
    generate()
    void stopMetronome()
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current)
      void stopMetronome()
    }
  }, [mode, clef, keyLabel, chordSource, progChords, generate])

  const scheduleNext = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current)
    nextTimerRef.current = setTimeout(() => generate(), 750)
  }, [generate])

  const handleNoteOn = useCallback((midi: number) => {
    setHeld((prev) => new Set(prev).add(midi))
    void noteOn(midi)
    sightHandlerRef.current?.(midi)
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

  useEffect(() => {
    if (held.size === 0) awaitingReleaseRef.current = false
  }, [held])

  useMidi((event, kind) => {
    if (kind === 'on') handleNoteOn(event.midi)
    else handleNoteOff(event.midi)
  })

  // Validation des modes "jouer"
  useEffect(() => {
    if (awaitingReleaseRef.current) return
    const heldMidis = [...held]
    const succeed = (message: string) => {
      awaitingReleaseRef.current = true
      setSession((s) => ({ correct: s.correct + 1, attempts: s.attempts + 1 }))
      setFeedback(message)
      scheduleNext()
    }
    if (mode === 'playNote') {
      if (heldMidis.some((m) => pitchClassOf(m) === pitchClassOf(note))) {
        succeed('Bien joué.')
      }
    } else if (mode === 'playChord') {
      if (
        heldMidis.length === triad.midis.length &&
        samePitchClassSet(heldMidis, triad.midis)
      ) {
        succeed('Accord correct.')
      }
    } else if (mode === 'interval') {
      if (heldMidis.length === 2 && samePitchClassSet(heldMidis, interval)) {
        succeed(`Intervalle correct (${intervalName(interval)}).`)
      }
    }
  }, [held, mode, note, triad, interval, scheduleNext])

  const sightReadOnPitch = (midiNote: number) => {
    if (mode !== 'sightRead' || !sightRunning) return
    const expected = melody.notes[sightIndex]
    if (!expected) return
    if (pitchClassOf(midiNote) === pitchClassOf(expected.midi)) {
      const spb = secondsPerBeat(tempo)
      let beatsBefore = 0
      for (let i = 0; i < sightIndex; i += 1) {
        beatsBefore += durationBeats(melody.notes[i]!.duration)
      }
      const expectedMs =
        sightStartRef.current + (COUNT_IN_BEATS + beatsBefore) * spb * 1000
      offsetsRef.current.push(performance.now() - expectedMs)
      const next = sightIndex + 1
      setSightIndex(next)
      if (next >= melody.notes.length) {
        const offsets = offsetsRef.current
        const averageOffset =
          offsets.length > 0
            ? offsets.reduce((sum, value) => sum + value, 0) / offsets.length
            : 0
        setSightResult({
          seconds: (performance.now() - sightStartRef.current) / 1000,
          mistakes,
          averageOffset,
          early: offsets.filter((value) => value < -TIMING_TOLERANCE_MS).length,
          late: offsets.filter((value) => value > TIMING_TOLERANCE_MS).length,
        })
        setSightRunning(false)
        void stopMetronome()
      }
    } else {
      setMistakes((value) => value + 1)
    }
  }
  const sightHandlerRef = useRef(sightReadOnPitch)
  useEffect(() => {
    sightHandlerRef.current = sightReadOnPitch
  })

  const startSightRead = () => {
    sightStartRef.current = performance.now()
    offsetsRef.current = []
    setSightIndex(0)
    setMistakes(0)
    setSightResult(null)
    setSightRunning(true)
    void startMetronome(tempo)
  }

  const answerName = (option: string) => {
    if (answered) return
    setAnswered(option)
    const correct = option === noteName(note)
    setSession((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      attempts: s.attempts + 1,
    }))
    setFeedback(correct ? 'Correct.' : `C’était ${noteName(note)}.`)
    scheduleNext()
  }

  const playEar = () => void playChord([note], 1.2)
  const keyModeActive = KEY_MODES.includes(mode)

  const staffKeySig =
    mode === 'playChord' && chordSource === 'progression'
      ? progressionKeySig
      : keyModeActive
        ? keySig
        : null

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Lecture & déchiffrage"
        description="Lis la portée, joue juste, et gagne en vitesse."
        actions={
          <>
            <Badge variant="secondary">Réussites : {session.correct}</Badge>
            <Badge variant="outline">Tentatives : {session.attempts}</Badge>
            <Button variant="outline" type="button" onClick={generate}>
              Nouveau
            </Button>
          </>
        }
      />

      <ControlBar>
        <Field label="Mode">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList>
              {(Object.keys(MODE_LABELS) as Mode[]).map((key) => (
                <TabsTrigger key={key} value={key}>
                  {MODE_LABELS[key]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </Field>
        {mode !== 'ear' ? (
          <Field label="Clé">
            <Tabs value={clef} onValueChange={(v) => setClef(v as Clef)}>
              <TabsList>
                <TabsTrigger value="treble">Sol</TabsTrigger>
                <TabsTrigger value="bass">Fa</TabsTrigger>
              </TabsList>
            </Tabs>
          </Field>
        ) : null}
        {mode === 'playChord' ? (
          <Field label="Source">
            <Tabs
              value={chordSource}
              onValueChange={(v) => setChordSource(v as ChordSource)}
            >
              <TabsList>
                <TabsTrigger value="progression">Ma progression</TabsTrigger>
                <TabsTrigger value="random">Aléatoire</TabsTrigger>
              </TabsList>
            </Tabs>
          </Field>
        ) : null}
        {keyModeActive &&
        !(mode === 'playChord' && chordSource === 'progression') ? (
          <Field label="Armure">
            <Select value={keyLabel} onValueChange={setKeyLabel}>
              <SelectTrigger className="w-32" aria-label="Armure">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KEY_SIGNATURE_TONICS.map((tonic) => (
                  <SelectItem key={tonic} value={tonic}>
                    {tonic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}
      </ControlBar>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        {mode === 'playChord' && chordSource === 'progression' ? (
          <p className="text-xs text-muted-foreground">
            {progKey} {progMode === 'major' ? 'majeur' : 'mineur'} ·{' '}
            {progRoman.join(' - ')}
          </p>
        ) : null}
        {mode === 'name' ? (
          <>
            <StaffFromMidis
              clef={clef}
              groups={[{ midis: [note], duration: 'w' }]}
            />
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={
                    answered === option
                      ? option === noteName(note)
                        ? 'default'
                        : 'destructive'
                      : 'outline'
                  }
                  onClick={() => answerName(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </>
        ) : null}

        {mode === 'playNote' || mode === 'playChord' || mode === 'interval' ? (
          <>
            {mode === 'playChord' && chordLabel ? (
              <Badge variant="secondary" className="self-start">
                {chordLabel}
              </Badge>
            ) : null}
            <StaffFromMidis
              clef={clef}
              keySignature={staffKeySig}
              groups={[
                mode === 'playChord'
                  ? { midis: triad.midis, duration: 'w' }
                  : mode === 'interval'
                    ? { midis: interval, duration: 'w' }
                    : { midis: [note], duration: 'w' },
              ]}
            />
            <PianoKeyboard
              startOctave={2}
              octaves={4}
              activeMidis={[...held]}
              onNoteOn={handleNoteOn}
              onNoteOff={handleNoteOff}
            />
          </>
        ) : null}

        {mode === 'sightRead' ? (
          <>
            <StaffFromMidis
              clef={clef}
              keySignature={staffKeySig}
              groups={melody.notes.map((n) => ({
                midis: [n.midi],
                duration: n.duration,
              }))}
              timeSignature="4/4"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={startSightRead}
                variant={sightRunning ? 'destructive' : 'default'}
              >
                {sightRunning ? 'En cours…' : 'Démarrer'}
              </Button>
              <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-muted-foreground">
                Tempo · {tempo} BPM
                <Slider
                  value={[tempo]}
                  min={50}
                  max={140}
                  step={2}
                  onValueChange={([value]) => setTempo(value ?? tempo)}
                />
              </label>
              <Badge variant="outline">
                {sightIndex}/{melody.notes.length} · {mistakes} erreur(s)
              </Badge>
            </div>
            <PianoKeyboard
              startOctave={2}
              octaves={4}
              activeMidis={[...held]}
              onNoteOn={handleNoteOn}
              onNoteOff={handleNoteOff}
            />
            {sightResult ? (
              <div className="flex flex-col gap-1 text-sm">
                <span>
                  Terminé en {sightResult.seconds.toFixed(1)} s ·{' '}
                  {sightResult.mistakes === 0
                    ? 'sans faute'
                    : `${sightResult.mistakes} erreur(s)`}
                </span>
                <span className="text-muted-foreground">
                  Précision rythmique : ±
                  {Math.abs(sightResult.averageOffset).toFixed(0)} ms (
                  {sightResult.averageOffset < 0 ? 'en avance' : 'en retard'}) ·
                  avant : {sightResult.early} · après : {sightResult.late}
                </span>
              </div>
            ) : null}
          </>
        ) : null}

        {mode === 'ear' ? (
          <div className="flex flex-col gap-3">
            <Button type="button" onClick={playEar} className="self-start">
              Écouter la note
            </Button>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={
                    answered === option
                      ? option === noteName(note)
                        ? 'default'
                        : 'destructive'
                      : 'outline'
                  }
                  onClick={() => answerName(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {feedback ? (
          <p className="text-sm text-muted-foreground">{feedback}</p>
        ) : null}
      </section>
    </div>
  )
}
