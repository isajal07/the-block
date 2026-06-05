# The Block — Backend API

TypeScript + Express API for the vehicle auction prototype. Serves the 200-vehicle
dataset from [`../data/vehicles.json`](../data/vehicles.json) and handles bids in memory.

## Stack

- **Runtime:** Node 24, ESM
- **Framework:** Express 5
- **Language:** TypeScript 6 (strict)
- **Dev runner:** tsx (watch mode, no build step)
- **Package manager:** pnpm

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:4000 with hot reload
```

Production-style:

```bash
pnpm build      # tsc -> dist/
pnpm start      # node dist/index.js
```

Set `PORT` to change the port (default `4000`).

## API

| Method | Path                      | Description                                              |
| ------ | ------------------------- | ------------------------------------------------------- |
| GET    | `/api/health`             | Liveness check                                          |
| GET    | `/api/makes`              | Distinct vehicle makes (for filters)                    |
| GET    | `/api/vehicles`           | List/search inventory                                   |
| GET    | `/api/vehicles/:id`       | Vehicle detail + its bid history                        |
| POST   | `/api/vehicles/:id/bids`  | Place a bid `{ "amount": number }`                      |

### `GET /api/vehicles` query params

- `q` — free-text search across make, model, trim, body style, city, dealership, lot
- `make` — exact make filter
- `sort` — `price_asc` \| `price_desc` \| `year_asc` \| `year_desc`
- `limit`, `offset` — pagination

Response: `{ "total": number, "items": Vehicle[] }`

### Bidding rules

A bid must be **strictly greater than the current bid**. On success the vehicle's
`current_bid` and `bid_count` update and a `201` is returned; an invalid bid returns
`422` with the required `minimum`.

> Bids are stored in memory only — restarting the server resets to the dataset's
> original values. Swapping the store for a database is the natural next step.

## Layout

```
src/
  index.ts   Express app + routes
  store.ts   In-memory store seeded from vehicles.json (search, sort, bids)
  types.ts   Vehicle / Bid types
```
