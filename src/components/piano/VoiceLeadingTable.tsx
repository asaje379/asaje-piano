import { pcToName } from '@/core/chords'
import type { SolveStep } from '@/core/voicing'
import { midiToLabel } from '@/core/pitch'

interface VoiceLeadingTableProps {
  steps: SolveStep[]
}

const INVERSIONS = ['fond.', '1er renv.', '2e renv.']

export function VoiceLeadingTable({ steps }: VoiceLeadingTableProps) {
  const rows = steps.filter((step) => step.fromPrevious !== null)

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun enchaînement à analyser pour l’instant.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 pr-3 font-medium">Enchaînement</th>
            <th className="py-2 pr-3 font-medium">Accord</th>
            <th className="py-2 pr-3 font-medium">Renversement</th>
            <th className="py-2 pr-3 font-medium">Notes communes</th>
            <th className="py-2 pr-3 font-medium">Demi-tons</th>
            <th className="py-2 pr-3 font-medium">Mouvement</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((step, index) => {
            const previous = steps[index]
            const info = step.fromPrevious
            if (!info || !previous) return null
            return (
              <tr
                key={`${step.chord.degreeLabel}-${index}`}
                className="border-b"
              >
                <td className="py-2 pr-3 font-mono text-xs">
                  {previous.chord.symbol} → {step.chord.symbol}
                </td>
                <td className="py-2 pr-3">
                  <span className="font-medium">{step.chord.symbol}</span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    {step.voicing.midis.map((m) => midiToLabel(m)).join(' ')}
                  </span>
                </td>
                <td className="py-2 pr-3">
                  {INVERSIONS[step.voicing.inversion] ?? '—'}
                </td>
                <td className="py-2 pr-3">
                  {info.commonTones.length > 0
                    ? info.commonTones.map((pc) => pcToName(pc)).join(', ')
                    : '—'}
                </td>
                <td className="py-2 pr-3">
                  {info.halfSteps > 0 ? `${info.halfSteps} × ½ ton` : '—'}
                </td>
                <td className="py-2 pr-3 font-mono">
                  {info.cost} <span className="text-xs">demi-tons</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
