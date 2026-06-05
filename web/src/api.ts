import type {
  VehicleDetailResponse,
  VehicleListResponse,
} from './types'

export interface ListParams {
  q?: string
  make?: string
  sort?: string
  limit?: number
  offset?: number
}

class ApiError extends Error {
  status: number
  minimum?: number
  constructor(message: string, status: number, minimum?: number) {
    super(message)
    this.status = status
    this.minimum = minimum
  }
}

async function parseError(res: Response): Promise<never> {
  let message = `Request failed (${res.status})`
  let minimum: number | undefined
  try {
    const body = await res.json()
    if (body?.error) message = body.error
    if (typeof body?.minimum === 'number') minimum = body.minimum
  } catch {
    /* non-JSON error body */
  }
  throw new ApiError(message, res.status, minimum)
}

export async function fetchVehicles(
  params: ListParams = {},
  signal?: AbortSignal,
): Promise<VehicleListResponse> {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.make) search.set('make', params.make)
  if (params.sort) search.set('sort', params.sort)
  if (params.limit != null) search.set('limit', String(params.limit))
  if (params.offset != null) search.set('offset', String(params.offset))

  const res = await fetch(`/api/vehicles?${search.toString()}`, { signal })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function fetchVehicle(
  id: string,
  signal?: AbortSignal,
): Promise<VehicleDetailResponse> {
  const res = await fetch(`/api/vehicles/${id}`, { signal })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function fetchMakes(signal?: AbortSignal): Promise<string[]> {
  const res = await fetch('/api/makes', { signal })
  if (!res.ok) return parseError(res)
  return res.json()
}

export async function placeBid(
  id: string,
  amount: number,
): Promise<VehicleDetailResponse['vehicle']> {
  const res = await fetch(`/api/vehicles/${id}/bids`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  })
  if (!res.ok) return parseError(res)
  const body = await res.json()
  return body.vehicle
}

export { ApiError }
