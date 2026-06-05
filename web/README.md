# The Block — Frontend

Buyer-facing UI for the vehicle auction prototype: browse/search inventory,
inspect a vehicle, and place bids with live state updates.

## Stack

- **React 19 + Vite 8** (TypeScript)
- **React Router 7** — inventory (`/`) and detail (`/vehicles/:id`) routes
- **Tailwind CSS v4** (via `@tailwindcss/vite`) — design tokens in `src/index.css`

## Run it

The frontend talks to the Express API in [`../server`](../server). Start that first
(`cd ../server && pnpm dev`), then:

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

Vite proxies `/api/*` to `http://localhost:4000`, so there's no CORS or base-URL
config to manage in development. Other scripts: `pnpm build`, `pnpm preview`,
`pnpm lint`.

## Structure

```
src/
  api.ts                  Typed fetch client (list, detail, makes, placeBid)
  types.ts                Vehicle / Bid shapes
  lib/format.ts           Money / km / date + grade + auction-status helpers
  App.tsx                 Layout shell (header, footer, <Outlet/>)
  pages/
    InventoryPage.tsx     Search, make filter, sort, load-more grid
    VehicleDetailPage.tsx Gallery, specs, condition, auction info, bid history
  components/
    VehicleCard.tsx       Inventory grid card
    BidPanel.tsx          Bid input, quick increments, validation, success state
    VehicleImage.tsx      Image with graceful fallback
    Badges.tsx            Grade / status / title pills
```

## Notable UX decisions

- **Debounced search** (250ms) across make, model, trim, body, city, dealership, lot.
- **Bid validation** mirrors the server (must beat the current bid); the server is
  the source of truth and its `minimum` is surfaced inline on rejection.
- **Reserve status** ("Reserve met / not met") shown as a trust signal without
  revealing the reserve amount on cards.
- **Auction state** is shown honestly as `Live` / `Upcoming` relative to now, since
  the dataset timestamps are synthetic (no fabricated countdown).
- Responsive single → multi-column layout; the detail-page bid panel sticks on desktop.
