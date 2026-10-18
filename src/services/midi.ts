export interface MidiNoteEvent {
  midi: number
  velocity: number
  time: number
}

export type MidiEventKind = 'on' | 'off'
export type MidiHandler = (event: MidiNoteEvent, kind: MidiEventKind) => void

export interface MidiConnection {
  devices: string[]
  dispose: () => void
}

export function isMidiSupported(): boolean {
  return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator
}

export async function connectMidi(
  handler: MidiHandler,
): Promise<MidiConnection> {
  if (!isMidiSupported()) {
    throw new Error('Web MIDI non supporté par ce navigateur.')
  }
  const access = await navigator.requestMIDIAccess()

  const parse = (event: MIDIMessageEvent) => {
    const data = event.data
    if (!data || data.length < 2) return
    const status = data[0] ?? 0
    const command = status & 0xf0
    const midi = data[1] ?? 0
    const velocity = data[2] ?? 0
    if (command === 0x90 && velocity > 0) {
      handler({ midi, velocity, time: event.timeStamp }, 'on')
    } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      handler({ midi, velocity: 0, time: event.timeStamp }, 'off')
    }
  }

  const devices: string[] = []
  access.inputs.forEach((input) => {
    devices.push(input.name ?? input.id)
    input.onmidimessage = (event) => parse(event)
  })

  return {
    devices,
    dispose: () => {
      access.onstatechange = null
      access.inputs.forEach((input) => {
        input.onmidimessage = null
      })
    },
  }
}
