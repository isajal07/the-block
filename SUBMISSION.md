# The Block

Buyer side of a vehicle auction platform: browse and search 200 listed vehicles,
inspect full detail (specs, condition, damage, photos, selling dealership), and
place bids with live, validated state.

## How to Run

**Prerequisites:** Node 20+ (built on Node 24) and pnpm. If you don't have pnpm,
enable it with `corepack enable`.

**One command (recommended)** — from the repo root:

```bash
make            # installs deps on first run, then starts both apps
```

- Web → http://localhost:5173
- API → http://localhost:4000

`Ctrl+C` stops both. (`make help` lists other targets.)

**Or run the two packages manually**, in separate terminals:

```bash
cd server && pnpm install && pnpm dev   # API on :4000
cd web    && pnpm install && pnpm dev   # web on :5173
```

The web app proxies `/api/*` to the backend in development, so there's nothing else
to configure.

## Time Spent

About 2 hours. I kept the scope tight on the core buyer journey — browse → inspect →
bid — and spent the remaining budget on UX polish and verifying the build end to end
rather than adding surface area.

## Assumptions and Scope

**Included:** inventory browsing, search, make filter, sorting, a full vehicle detail
view, and a working bid flow with server-side validation and visible state updates.

**Intentionally skipped** (per the brief): authentication/accounts, checkout,
payments, seller/dealer workflows, and admin tooling.

**Simplified:**

- **Bids are stored in memory.** They update live during a session and reset when the
  API restarts. The store has a clean seam (`server/src/store.ts`) to swap for a real
  database without touching the routes.
- **Auction timestamps are treated as synthetic** (as the brief allows). I show an
  honest `Live` / `Upcoming` status relative to "now" rather than fabricating a
  countdown, since the dataset has start times but no end times.
- Money is formatted as CAD given the Canadian locations in the data.

## Stack

- **Frontend:** React 19 + Vite 8 (TypeScript), React Router 7, Tailwind CSS v4
- **Backend:** Node + Express 5 (TypeScript, run with `tsx`)
- **Database:** None — an in-memory store seeded from `data/vehicles.json`

## What I Built

A small two-part app:

- **API** (`server/`) — serves the inventory and arbitrates bids. Endpoints: list/
  search (`/api/vehicles`), detail + bid history (`/api/vehicles/:id`), place bid
  (`POST /api/vehicles/:id/bids`), plus `/api/makes` and `/api/health`. Search, filter,
  and sort happen server-side.
- **Web** (`web/`) — an inventory grid with debounced search, make filter, sort, and
  load-more paging; and a detail page with an image gallery, spec grid, condition
  report with inspection grade and damage notes, auction info, and a bid panel
  (quick-increment buttons, inline validation, success state, and live bid history).

## Notable Decisions

- **I built a backend even though frontend-only was acceptable.** A bid is the one
  action with real rules, so I wanted those rules enforced in one authoritative place
  rather than trusting the client. The API owns bid validation; the UI mirrors it for
  fast feedback but the server is the source of truth, and bid state is shared across
  the session.
- **In-memory store over a database.** For a prototype in this time box, a seeded
  in-memory store keeps setup to zero while isolating persistence behind one module —
  so "add a database" is a contained change, not a rewrite.
- **Honest auction state.** I show `Live`/`Upcoming` instead of a fake countdown
  because the data is synthetic and only has start times; I'd rather not imply
  precision that isn't there.
- **Reserve as a trust signal.** Cards show "Reserve met / not met" without revealing
  the reserve amount — useful to a buyer, faithful to how auctions actually surface it.
- **Tailwind v4 + a dev proxy** for fast, consistent, responsive styling and a
  CORS-free local setup. I used current versions of the stack throughout.

## Testing

Manual and scripted, focused on the timebox:

- **Type safety:** `tsc` passes for both packages; both produce clean production builds.
- **API behavior:** exercised every endpoint over HTTP — list/sort, detail, a valid
  bid (current bid and count update), a too-low bid (`422` with the required minimum),
  and an unknown id (`404`).
- **UI:** captured desktop and mobile screenshots via headless Chrome, and measured the
  layout over the DevTools Protocol to confirm zero horizontal overflow on mobile.

I did not add an automated unit/e2e suite given the time box; that's the first thing
I'd add next (see below).

## What I'd Do With More Time

- **Persistence + real-time:** move bids to a database and push updates over WebSocket/
  SSE so bids appear live and outbids notify the buyer.
- **Concurrency:** handle simultaneous bids (optimistic locking / minimum-increment by
  price tier) so two buyers can't race the same amount.
- **Automated tests:** Vitest for the store/API and Playwright for the browse→bid flow.
- **Richer discovery:** price/year/body-style/location filters, a watchlist, and
  infinite scroll instead of load-more.
- **Accounts:** lightweight buyer identity so bid history is per-user and "you're the
  high bidder" persists.
- **Accessibility pass:** focus management, keyboard nav, and ARIA on the gallery and
  bid controls.
