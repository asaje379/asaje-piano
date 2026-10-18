import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MidiStatus as MidiStatusType } from '@/hooks/useMidi'

interface MidiStatusProps {
  status: MidiStatusType
  devices: string[]
  error: string | null
  onConnect: () => void
}

const LABELS: Record<MidiStatusType, string> = {
  unsupported: 'MIDI non supporté',
  disconnected: 'Piano non connecté',
  connecting: 'Connexion…',
  connected: 'Piano connecté',
  error: 'Erreur MIDI',
}

export function MidiStatus({
  status,
  devices,
  error,
  onConnect,
}: MidiStatusProps) {
  const variant =
    status === 'connected'
      ? 'default'
      : status === 'error'
        ? 'destructive'
        : 'secondary'
  const canConnect = status !== 'connected' && status !== 'unsupported'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={variant}>
        {LABELS[status]}
        {status === 'connected' && devices.length > 0
          ? ` · ${devices.join(', ')}`
          : ''}
      </Badge>
      {canConnect ? (
        <Button
          size="sm"
          variant="outline"
          onClick={onConnect}
          disabled={status === 'connecting'}
        >
          Connecter le piano
        </Button>
      ) : null}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  )
}
