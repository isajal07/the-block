import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchVehicle } from '../api'
import type { Bid, Vehicle } from '../types'
import { VehicleImage } from '../components/VehicleImage'
import { BidPanel } from '../components/BidPanel'
import { GradeBadge, StatusBadge, TitlePill } from '../components/Badges'
import {
  auctionStatus,
  formatDate,
  formatKm,
  formatMoney,
  titleCase,
} from '../lib/format'

export function VehicleDetailPage() {
  const { id = '' } = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetchVehicle(id, controller.signal)
      .then((res) => {
        setVehicle(res.vehicle)
        setBids(res.bids)
        setActiveImage(0)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Failed to load vehicle')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [id])

  function handleBidPlaced(updated: Vehicle, bid: Bid) {
    setVehicle(updated)
    setBids((prev) => [bid, ...prev])
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-slate-600">{error ?? 'Vehicle not found.'}</p>
        <Link to="/" className="text-brand-600 hover:underline">
          ← Back to inventory
        </Link>
      </div>
    )
  }

  const status = auctionStatus(vehicle.auction_start)
  const specs: { label: string; value: string }[] = [
    { label: 'Odometer', value: formatKm(vehicle.odometer_km) },
    { label: 'Engine', value: vehicle.engine },
    { label: 'Transmission', value: titleCase(vehicle.transmission) },
    { label: 'Drivetrain', value: vehicle.drivetrain },
    { label: 'Fuel', value: titleCase(vehicle.fuel_type) },
    { label: 'Body style', value: vehicle.body_style },
    { label: 'Exterior', value: vehicle.exterior_color },
    { label: 'Interior', value: vehicle.interior_color },
    { label: 'VIN', value: vehicle.vin },
  ]

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-800"
      >
        ← Back to inventory
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Left: gallery + details */}
        <div className="space-y-6">
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100">
              <VehicleImage
                src={vehicle.images[activeImage]}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute left-3 top-3">
                <StatusBadge live={status.live} />
              </div>
            </div>
            {vehicle.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {vehicle.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === activeImage
                        ? 'border-brand-500'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <VehicleImage
                      src={img}
                      alt={`View ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Specifications
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {specs.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs text-slate-400">{s.label}</dt>
                  <dd className="font-medium text-slate-800">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Condition
              </h2>
              <GradeBadge grade={vehicle.condition_grade} />
            </div>
            <p className="text-slate-700">{vehicle.condition_report}</p>
            {vehicle.damage_notes.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-slate-400">
                  Damage notes
                </p>
                <ul className="space-y-1.5">
                  {vehicle.damage_notes.map((note, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Right: title, bid panel, seller */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TitlePill status={vehicle.title_status} />
              <span className="text-xs text-slate-400">Lot {vehicle.lot}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-slate-500">
              {vehicle.trim} · {vehicle.city}, {vehicle.province}
            </p>
          </div>

          <BidPanel vehicle={vehicle} onBidPlaced={handleBidPlaced} />

          <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Auction
            </h2>
            <dl className="space-y-2 text-sm">
              <Row label="Starting bid" value={formatMoney(vehicle.starting_bid)} />
              <Row
                label="Reserve"
                value={
                  vehicle.reserve_price != null
                    ? formatMoney(vehicle.reserve_price)
                    : 'No reserve'
                }
              />
              <Row label="Auction start" value={formatDate(vehicle.auction_start)} />
              <Row label="Seller" value={vehicle.selling_dealership} />
            </dl>
          </section>

          {bids.length > 0 && (
            <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Recent bids
              </h2>
              <ul className="space-y-2">
                {bids.slice(0, 6).map((bid) => (
                  <li
                    key={bid.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-semibold text-slate-800">
                      {formatMoney(bid.amount)}
                    </span>
                    <span className="text-slate-400">
                      {new Date(bid.placedAt).toLocaleTimeString('en-CA', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  )
}
