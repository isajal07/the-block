import { Link } from 'react-router-dom'
import type { Vehicle } from '../types'
import { auctionStatus, formatKm, formatMoney } from '../lib/format'
import { VehicleImage } from './VehicleImage'
import { GradeBadge, StatusBadge } from './Badges'

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const status = auctionStatus(vehicle.auction_start)
  const reserveMet =
    vehicle.reserve_price != null && vehicle.current_bid >= vehicle.reserve_price

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <VehicleImage
          src={vehicle.images[0]}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge live={status.live} />
        </div>
        <div className="absolute right-3 top-3">
          <GradeBadge grade={vehicle.condition_grade} />
        </div>
        <span className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
          Lot {vehicle.lot}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-semibold leading-tight text-slate-900">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-sm text-slate-500">
            {vehicle.trim} · {vehicle.body_style}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>{formatKm(vehicle.odometer_km)}</span>
          <span className="text-slate-300">•</span>
          <span>
            {vehicle.city}, {vehicle.province}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-xs text-slate-400">Current bid</p>
            <p className="text-lg font-bold text-slate-900">
              {formatMoney(vehicle.current_bid)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">
              {vehicle.bid_count} {vehicle.bid_count === 1 ? 'bid' : 'bids'}
            </p>
            {vehicle.reserve_price != null && (
              <p
                className={`text-xs font-medium ${reserveMet ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                {reserveMet ? 'Reserve met' : 'Reserve not met'}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
