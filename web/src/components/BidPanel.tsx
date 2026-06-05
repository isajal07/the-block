import { useEffect, useState } from 'react'
import { ApiError, placeBid } from '../api'
import type { Bid, Vehicle } from '../types'
import { formatMoney } from '../lib/format'

interface Props {
  vehicle: Vehicle
  onBidPlaced: (vehicle: Vehicle, bid: Bid) => void
}

const QUICK = [100, 500, 1000]

export function BidPanel({ vehicle, onBidPlaced }: Props) {
  const minNext = vehicle.current_bid + 100
  const [amount, setAmount] = useState<string>(String(minNext))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justWon, setJustWon] = useState(false)

  // Keep the suggested amount ahead of the current bid as it changes.
  useEffect(() => {
    setAmount(String(vehicle.current_bid + 100))
  }, [vehicle.current_bid])

  const reserveMet =
    vehicle.reserve_price != null && vehicle.current_bid >= vehicle.reserve_price

  async function submit() {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= vehicle.current_bid) {
      setError(`Enter more than ${formatMoney(vehicle.current_bid)}`)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const updated = await placeBid(vehicle.id, value)
      const optimisticBid: Bid = {
        id: crypto.randomUUID(),
        vehicleId: vehicle.id,
        amount: value,
        placedAt: new Date().toISOString(),
      }
      onBidPlaced(updated, optimisticBid)
      setJustWon(true)
      setTimeout(() => setJustWon(false), 2500)
    } catch (err) {
      if (err instanceof ApiError && err.minimum) {
        setError(`Bid must be at least ${formatMoney(err.minimum)}`)
      } else {
        setError(err instanceof Error ? err.message : 'Could not place bid')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Current bid
          </p>
          <p className="text-3xl font-bold text-slate-900">
            {formatMoney(vehicle.current_bid)}
          </p>
        </div>
        <p className="pb-1 text-sm text-slate-500">
          {vehicle.bid_count} {vehicle.bid_count === 1 ? 'bid' : 'bids'}
        </p>
      </div>

      {vehicle.reserve_price != null && (
        <p
          className={`mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
            reserveMet
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${reserveMet ? 'bg-emerald-500' : 'bg-slate-400'}`}
          />
          {reserveMet ? 'Reserve met' : 'Reserve not yet met'}
        </p>
      )}

      <div className="mt-4 space-y-3">
        <label className="block text-sm font-medium text-slate-600">
          Your bid
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              $
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              min={minNext}
              step={100}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-7 pr-3 text-lg font-semibold outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK.map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => setAmount(String(vehicle.current_bid + inc))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              +{formatMoney(inc)}
            </button>
          ))}
        </div>

        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.99] disabled:opacity-60"
        >
          {submitting ? 'Placing bid…' : 'Place bid'}
        </button>

        {justWon && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700">
            You're the high bidder!
          </p>
        )}

        {vehicle.buy_now_price != null && (
          <div className="border-t border-slate-100 pt-3 text-center text-sm text-slate-500">
            Buy now available at{' '}
            <span className="font-semibold text-slate-800">
              {formatMoney(vehicle.buy_now_price)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
