# The Block

This is the buyer side of a vehicle auction platform. You can browse and search the
200 listed vehicles, open one to see the full detail (specs, condition, damage notes,
photos, and the selling dealership), and place bids that update live.

## How to Run

You'll need Node 20 or newer (I built it on Node 24) and pnpm. If pnpm isn't installed,
run `corepack enable` once and you're set.

The easiest way is one command from the repo root:

```bash
make            # installs deps the first time, then starts both apps
```

That brings up the web app at http://localhost:5173 and the API at
http://localhost:4000. Hit `Ctrl+C` to stop both. Run `make help` to see the other
targets.

If you'd rather run the two pieces yourself, open two terminals:

```bash
cd server && pnpm install && pnpm dev   # API on :4000
cd web    && pnpm install && pnpm dev   # web on :5173
```

In development the web app proxies `/api/*` to the backend, so there's nothing else to
wire up.

## Time Spent

About 2 hours. I used Claude code to make my life easier.
I kept the focus on the core buyer journey, browse then inspect then
bid, and spent what was left on polishing the experience and checking that everything
actually runs end to end.

## Assumptions and Scope

What I included: browsing the inventory, searching it, filtering by make, sorting, a
full vehicle detail view, and a working bid flow with server-side validation and
visible state updates.

What I left out on purpose, since the brief said they weren't needed: sign-in and
accounts, checkout, payments, seller and dealer workflows, and any admin tooling.

A few things I deliberately simplified:

- Bids live in memory. They update while you're using the app and reset when the API
  restarts. I kept all of that behind one module (`server/src/store.ts`), so dropping
  in a real database later wouldn't touch the routes.
- I treated the auction timestamps as synthetic, which the brief allows. Instead of
  faking a countdown, I show a simple `Live` or `Upcoming` status based on the start
  time, since the data has start times but no end times.
- Money is shown in CAD, since the locations in the data are Canadian.

## Stack

- **Frontend:** React 19 and Vite 8 with TypeScript, React Router 7, and Tailwind CSS v4
- **Backend:** Node and Express 5 in TypeScript, run with `tsx`
- **Database:** none. An in-memory store seeded from `data/vehicles.json`

## What I Built

It's a small two-part app.

The API (`server/`) serves the inventory and handles bids. It exposes list and search
at `/api/vehicles`, detail plus bid history at `/api/vehicles/:id`, bidding at
`POST /api/vehicles/:id/bids`, and a couple of helpers in `/api/makes` and
`/api/health`. Searching, filtering, and sorting all happen on the server.

The web app (`web/`) has an inventory grid with debounced search, a make filter,
sorting, and a load-more button for paging. The detail page has an image gallery, a
spec grid, the condition report with its inspection grade and damage notes, the auction
details, and a bid panel with quick-increment buttons, inline validation, a success
state, and a running list of recent bids.

## Notable Decisions

I added a backend even though a frontend-only build would have been fine. Placing a bid
is the one action with real rules, and I wanted those rules enforced in a single place
the client can't bypass. The API is the source of truth for bid validation; the UI
mirrors it so feedback feels instant, and because the state lives on the server, bids
are shared across the session rather than stuck in one browser tab.

I went with an in-memory store instead of a database. For a prototype in this time box
it keeps setup at zero, and since persistence sits behind one module, adding a real
database later is a contained change rather than a rewrite.

I kept the auction state honest. Rather than a countdown that would only be guesswork,
I show `Live` or `Upcoming`, because the data is synthetic and only gives me start
times. I'd rather not imply precision that isn't really there.

I used the reserve price as a trust signal. Cards say whether the reserve is met or not
without showing the actual number, which is what's useful to a buyer and matches how
auctions tend to surface it.

For the build itself I leaned on Tailwind v4 and a dev proxy to keep styling fast and
consistent and the local setup free of CORS fiddling, and I used current versions of
the stack throughout.

## Testing

I tested by hand and with a few scripts, sized to the time I had.

- Both packages type-check cleanly with `tsc` and produce working production builds.
- I exercised every endpoint over HTTP: list and sort, detail, a valid bid (the current
  bid and count both move), a too-low bid (a `422` with the minimum it needs), and an
  unknown id (a `404`).
- For the UI I took desktop and mobile screenshots with headless Chrome, and measured
  the page over the DevTools Protocol to confirm there's no horizontal overflow on
  mobile.

I didn't write an automated unit or end-to-end suite given the time box. That's the
first thing I'd add next.

## What I'd Do With More Time

- Move bids into a database and push updates over WebSocket or SSE, so bids show up
  live and a buyer gets told when they've been outbid.
- Handle simultaneous bids properly, with optimistic locking or a minimum increment by
  price tier, so two buyers can't land on the same amount at once.
- Add real tests: Vitest for the store and API, and Playwright for the browse-to-bid
  flow.
- Make discovery richer with filters for price, year, body style, and location, a
  watchlist, and infinite scroll in place of load-more.
- Add lightweight buyer accounts, so bid history is per-person and "you're the high
  bidder" sticks around.
- Do an accessibility pass: focus handling, keyboard navigation, and ARIA on the gallery
  and the bid controls.
