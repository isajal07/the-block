import { gradeTone } from '../lib/format'

export function GradeBadge({ grade }: { grade: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${gradeTone(grade)}`}
      title="Inspection grade (out of 5)"
    >
      {grade.toFixed(1)}
      <span className="font-normal opacity-70">/5</span>
    </span>
  )
}

export function StatusBadge({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur ${
        live ? 'bg-emerald-500/90 text-white' : 'bg-slate-900/70 text-white'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? 'animate-pulse bg-white' : 'bg-slate-300'}`}
      />
      {live ? 'Live' : 'Upcoming'}
    </span>
  )
}

export function TitlePill({ status }: { status: string }) {
  const clean = status.toLowerCase() === 'clean'
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
        clean ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {status} title
    </span>
  )
}
