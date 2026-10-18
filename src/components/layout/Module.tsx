import { cn } from 'cn'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

interface ControlBarProps {
  children: ReactNode
  className?: string
}

export function ControlBar({ children, className }: ControlBarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-x-4 gap-y-3 rounded-xl border border-border bg-card/50 p-3',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface FieldProps {
  label: string
  children: ReactNode
  className?: string
}

export function Field({ label, children, className }: FieldProps) {
  return (
    <label className={cn('flex flex-col gap-1', className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

interface PanelProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function Panel({ title, description, children, className }: PanelProps) {
  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-4',
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}
