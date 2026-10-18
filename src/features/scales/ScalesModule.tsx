import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '@/components/layout/Module'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  PianoKeyboard,
  type NoteHighlight,
} from '@/components/piano/PianoKeyboard'
import { chordTonePcs } from '@/core/chords'
import { NOTE_NAMES, midiToLabel } from '@/core/pitch'
import {
  buildProgression,
  KEY_TONICS,
  parseProgressionString,
  tonicToPc,
} from '@/core/progressions'
import { getScale, SCALES, scaleMidis } from '@/core/scales'
import { type BackingTrack, tracksForStyle } from '@/data/backingTracks'
import { ARPEGGIOS, getStyle, STYLES, styleOfTheDayId } from '@/data/styles'
import {
  startGeneratedTrack,
  type AccompanimentPattern,
  type GeneratedTrack,
} from '@/services/backing'
import { playMelody } from '@/services/player'
import { useStyleStore } from '../styles/useStyleStore'

const PATTERN_LABELS: Record<AccompanimentPattern, string> = {
  block: 'Accords plaqués',
  bassChord: 'Basse + accord',
  broken: 'Arpège brisé',
}

function BackingTrackGallery({ tracks }: { tracks: BackingTrack[] }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [current, setCurrent] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = (track: BackingTrack) => {
    const audio = audioRef.current
    if (!audio) return
    if (current === track.file) {
      if (audio.paused) {
        void audio.play()
        setPlaying(true)
      } else {
        audio.pause()
        setPlaying(false)
      }
      return
    }
    audio.src = track.file
    void audio.play()
    setCurrent(track.file)
    setPlaying(true)
  }

  return (
    <div className="flex flex-col gap-2">
      {tracks.map((track) => {
        const isCurrent = current === track.file
        return (
          <div
            key={track.id}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
          >
            <Button
              size="sm"
              variant={isCurrent ? 'default' : 'outline'}
              onClick={() => toggle(track)}
            >
              {isCurrent && playing ? 'Pause' : 'Jouer'}
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{track.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {track.author} · {track.license}
              </p>
            </div>
          </div>
        )
      })}
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
      />
    </div>
  )
}

export function ScalesModule() {
  const { styleId, setStyleId, pattern, setPattern } = useStyleStore()
  const style = getStyle(styleId) ?? STYLES[0]!
  const isToday = styleId === styleOfTheDayId()
  const tracks = useMemo(() => tracksForStyle(style.id), [style.id])
  const styleArpeggios = useMemo(
    () => ARPEGGIOS.filter((arpeggio) => style.arpeggios.includes(arpeggio.id)),
    [style],
  )

  const [progressionIndex, setProgressionIndex] = useState(0)
  const [genKey, setGenKey] = useState('C')
  const [genTempo, setGenTempo] = useState(style.defaultTempo)

  const genChords = useMemo(
    () =>
      buildProgression(
        parseProgressionString(
          style.progressions[progressionIndex] ?? style.progressions[0] ?? 'I',
        ),
        genKey,
        style.mode,
      ),
    [style, progressionIndex, genKey],
  )

  const [genState, setGenState] = useState<'idle' | 'playing'>('idle')
  const genRef = useRef<GeneratedTrack | null>(null)

  const stopGenerated = () => {
    genRef.current?.stop()
    genRef.current = null
    setGenState('idle')
  }

  useEffect(() => {
    return () => {
      genRef.current?.stop()
      genRef.current = null
    }
  }, [genChords, genTempo, pattern])

  const toggleGenerated = async () => {
    if (genState === 'playing') {
      stopGenerated()
      return
    }
    genRef.current = await startGeneratedTrack({
      chords: genChords,
      tempo: genTempo,
      pattern,
    })
    setGenState('playing')
  }

  const [scaleId, setScaleId] = useState('pentatonicMinor')
  const [scaleTonic, setScaleTonic] = useState('C')
  const scale = getScale(scaleId) ?? SCALES[0]!

  const scaleNotes = useMemo(() => {
    const pc = tonicToPc(scaleTonic)
    return [3, 4, 5].flatMap((octave) => scaleMidis(pc, scale, octave))
  }, [scaleTonic, scale])

  const chordsTonePcs = useMemo(() => {
    const first = genChords[0]
    return first ? chordTonePcs(first.rootPc, first.quality) : []
  }, [genChords])

  const highlights = useMemo(() => {
    const map: Record<number, NoteHighlight> = {}
    for (const midi of scaleNotes) map[midi] = 'target'
    for (const midi of scaleNotes) {
      if (chordsTonePcs.includes(midi % 12)) map[midi] = 'common'
    }
    return map
  }, [scaleNotes, chordsTonePcs])

  const [motif, setMotif] = useState<number[]>([])

  const playMotif = () => {
    const pool = scaleNotes.filter((midi) => midi >= 60 && midi <= 79)
    if (pool.length === 0) return
    const notes = Array.from(
      { length: 4 },
      () => pool[Math.floor(Math.random() * pool.length)] as number,
    )
    setMotif(notes)
    void playMelody(notes)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Gammes & impro"
        description="Style du jour, gammes, notes cibles et improvisation."
      />
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                Style du jour
                {isToday ? <Badge>aujourd’hui</Badge> : null}
              </CardTitle>
              <CardDescription>{style.description}</CardDescription>
            </div>
            <Select
              value={styleId}
              onValueChange={(value) => {
                setStyleId(value)
                setProgressionIndex(0)
              }}
            >
              <SelectTrigger className="w-44" aria-label="Style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {style.progressions.map((progression, index) => (
              <Button
                key={progression}
                size="sm"
                variant={index === progressionIndex ? 'default' : 'outline'}
                onClick={() => setProgressionIndex(index)}
              >
                {progression}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {styleArpeggios.map((arpeggio) => (
              <Badge key={arpeggio.id} variant="secondary">
                {arpeggio.label}
              </Badge>
            ))}
            <span className="text-xs text-muted-foreground">
              {styleArpeggios.map((a) => a.description).join(' ')}
            </span>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Tonalité
              <Select value={genKey} onValueChange={setGenKey}>
                <SelectTrigger
                  className="w-24"
                  aria-label="Tonalité d'accompagnement"
                >
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
              Motif main gauche
              <Tabs
                value={pattern}
                onValueChange={(value) =>
                  setPattern(value as AccompanimentPattern)
                }
              >
                <TabsList>
                  {(Object.keys(PATTERN_LABELS) as AccompanimentPattern[]).map(
                    (key) => (
                      <TabsTrigger key={key} value={key}>
                        {PATTERN_LABELS[key]}
                      </TabsTrigger>
                    ),
                  )}
                </TabsList>
              </Tabs>
            </label>

            <label className="flex min-w-52 flex-1 flex-col gap-1 text-xs text-muted-foreground">
              Tempo · {genTempo} BPM
              <Slider
                value={[genTempo]}
                min={50}
                max={180}
                step={2}
                onValueChange={([value]) => setGenTempo(value ?? genTempo)}
              />
            </label>

            <Button
              type="button"
              onClick={() => void toggleGenerated()}
              variant={genState === 'playing' ? 'destructive' : 'default'}
            >
              {genState === 'playing'
                ? 'Arrêter l’accompagnement'
                : 'Générer l’accompagnement'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Galerie hors-ligne</CardTitle>
            <CardDescription>
              2-3 pistes du style « {style.label} » à écouter et jouer
              par-dessus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tracks.length > 0 ? (
              <BackingTrackGallery tracks={tracks} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune piste pour ce style.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Explorateur de gamme</CardTitle>
            <CardDescription>{scale.usage}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Tonique
                <Select value={scaleTonic} onValueChange={setScaleTonic}>
                  <SelectTrigger
                    className="w-24"
                    aria-label="Tonique de la gamme"
                  >
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
              <label className="flex min-w-44 flex-1 flex-col gap-1 text-xs text-muted-foreground">
                Gamme
                <Select value={scaleId} onValueChange={setScaleId}>
                  <SelectTrigger className="w-full" aria-label="Gamme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCALES.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void playMelody(scaleMidis(tonicToPc(scaleTonic), scale, 4))
                }
              >
                Écouter la gamme
              </Button>
            </div>

            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
              {scaleMidis(tonicToPc(scaleTonic), scale, 4).map((midi) => (
                <Badge key={midi} variant="outline" className="font-mono">
                  {midiToLabel(midi)}
                </Badge>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              En <span className="text-hl-common">vert</span> : les notes de
              l’accord en cours (cibles). En{' '}
              <span className="text-hl-target">violet</span> : les autres notes
              de la gamme.
            </p>

            <PianoKeyboard
              startOctave={2}
              octaves={4}
              highlights={highlights}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Improvisation</CardTitle>
          <CardDescription>
            Joue sur la gamme « {scale.label} » de {scaleTonic}. Cible d’abord
            les notes de l’accord (
            {chordsTonePcs.map((pc) => NOTE_NAMES[pc]).join(', ') || '—'}), les
            autres notes relient ces cibles.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            <li>Commence et termine tes phrases sur une note de l’accord.</li>
            <li>
              Les notes hors accord servent de passage : garde-les courtes.
            </li>
            <li>Répète un petit motif, puis déplace-le d’une note.</li>
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={playMotif}>
              Jouer un motif
            </Button>
            {motif.length > 0 ? (
              <>
                <span className="text-sm text-muted-foreground">Répète :</span>
                {motif.map((midi, index) => (
                  <Badge
                    key={`${midi}-${index}`}
                    variant="secondary"
                    className="font-mono"
                  >
                    {midiToLabel(midi)}
                  </Badge>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void playMelody(motif)}
                >
                  Réécouter
                </Button>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
