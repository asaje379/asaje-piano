import { useCallback, useEffect, useRef, useState } from 'react'
import {
  connectMidi,
  isMidiSupported,
  type MidiConnection,
  type MidiHandler,
} from '@/services/midi'

export type MidiStatus =
  'unsupported' | 'disconnected' | 'connecting' | 'connected' | 'error'

export function useMidi(handler: MidiHandler) {
  const [status, setStatus] = useState<MidiStatus>(
    isMidiSupported() ? 'disconnected' : 'unsupported',
  )
  const [devices, setDevices] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const connectionRef = useRef<MidiConnection | null>(null)
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  const connect = useCallback(async () => {
    if (!isMidiSupported()) {
      setStatus('unsupported')
      return
    }
    setStatus('connecting')
    setError(null)
    try {
      connectionRef.current?.dispose()
      const connection = await connectMidi((event, kind) =>
        handlerRef.current(event, kind),
      )
      connectionRef.current = connection
      setDevices(connection.devices)
      setStatus('connected')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
      setStatus('error')
    }
  }, [])

  useEffect(() => () => connectionRef.current?.dispose(), [])

  return { status, devices, error, connect }
}
