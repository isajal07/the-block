const currency = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat('en-CA')

export function formatMoney(value: number | null | undefined): string {
  if (value == null) return '—'
  return currency.format(value)
}

export function formatKm(km: number): string {
  return `${number.format(km)} km`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Auction timestamps in the dataset are synthetic. We present a simple, honest
 * "Live" / "Upcoming" status relative to now rather than faking a countdown.
 */
export function auctionStatus(iso: string): { label: string; live: boolean } {
  const start = new Date(iso).getTime()
  const live = !Number.isNaN(start) && start <= Date.now()
  return { label: live ? 'Live' : 'Upcoming', live }
}

/** Color treatment for a 1–5 inspection grade. */
export function gradeTone(grade: number): string {
  if (grade >= 4) return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (grade >= 3) return 'bg-amber-50 text-amber-700 ring-amber-200'
  return 'bg-rose-50 text-rose-700 ring-rose-200'
}

export function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase())
}
