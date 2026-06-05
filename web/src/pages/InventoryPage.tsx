import { useEffect, useState } from 'react'
import { fetchMakes, fetchVehicles } from '../api'
import type { SortKey, Vehicle } from '../types'
import { VehicleCard } from '../components/VehicleCard'

const PAGE_SIZE = 24

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'price_desc', label: 'Highest bid' },
  { value: 'price_asc', label: 'Lowest bid' },
  { value: 'year_desc', label: 'Newest year' },
  { value: 'year_asc', label: 'Oldest year' },
]

export function InventoryPage() {
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [make, setMake] = useState('')
  const [sort, setSort] = useState<SortKey>('price_desc')
  const [makes, setMakes] = useState<string[]>([])

  const [items, setItems] = useState<Vehicle[]>([])
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce the free-text search box.
  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 250)
    return () => clearTimeout(t)
  }, [search])

  // Reset paging whenever the query changes.
  useEffect(() => {
    setLimit(PAGE_SIZE)
  }, [q, make, sort])

  useEffect(() => {
    fetchMakes().then(setMakes).catch(() => {})
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetchVehicles({ q, make, sort, limit }, controller.signal)
      .then((res) => {
        setItems(res.items)
        setTotal(res.total)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Failed to load inventory')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [q, make, sort, limit])

  const hasMore = items.length < total

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Browse inventory
        </h1>
        <p className="mt-1 text-slate-500">
          {loading && !items.length
            ? 'Loading vehicles…'
            : `${total} vehicle${total === 1 ? '' : 's'} up for auction`}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search make, model, city, dealership…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <select
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
        >
          <option value="">All makes</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!error && !loading && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          No vehicles match your search.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && items.length === 0
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : items.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? 'Loading…' : `Load more (${total - items.length} left)`}
          </button>
        </div>
      )}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  )
}
