import express from "express";
import type { Request, Response } from "express";
import {
  getBids,
  getVehicle,
  listVehicles,
  makes,
  placeBid,
  type VehicleQuery,
} from "./store.ts";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(express.json());

// Allow a separately-served frontend (e.g. Vite on :5173) to call the API.
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.options(/.*/, (_req, res) => res.sendStatus(204));

/**
 * GET /api/health
 * Liveness check. Returns `{ status: "ok", uptime }` (uptime in seconds).
 */
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

/**
 * GET /api/makes
 * Distinct vehicle makes across the inventory, sorted alphabetically.
 * Used to populate the make filter on the frontend.
 * Returns `string[]`.
 */
app.get("/api/makes", (_req: Request, res: Response) => {
  res.json(makes());
});

/**
 * GET /api/vehicles
 * List and search the inventory.
 *
 * Query params (all optional):
 *   - q       free-text search across make, model, trim, body, city, dealership, lot
 *   - make    exact make filter (e.g. "Ford")
 *   - sort    "price_asc" | "price_desc" | "year_asc" | "year_desc"
 *   - limit   max items to return (defaults to all matches)
 *   - offset  number of matches to skip, for pagination
 *
 * Returns `{ total, items: Vehicle[] }`, where `total` is the full match count
 * before limit/offset are applied.
 */
app.get("/api/vehicles", (req: Request, res: Response) => {
  const { q, make, sort, limit, offset } = req.query;
  const query: VehicleQuery = {
    q: typeof q === "string" ? q : undefined,
    make: typeof make === "string" ? make : undefined,
    sort: typeof sort === "string" ? (sort as VehicleQuery["sort"]) : undefined,
    limit: typeof limit === "string" ? Number(limit) : undefined,
    offset: typeof offset === "string" ? Number(offset) : undefined,
  };
  res.json(listVehicles(query));
});

/**
 * GET /api/vehicles/:id
 * Full detail for a single vehicle, plus its bid history (newest first).
 *
 * Returns `{ vehicle: Vehicle, bids: Bid[] }`, or 404 if the id is unknown.
 */
app.get("/api/vehicles/:id", (req: Request, res: Response) => {
  const vehicle = getVehicle(String(req.params.id));
  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json({ vehicle, bids: getBids(vehicle.id) });
});

/**
 * POST /api/vehicles/:id/bids
 * Place a bid on a vehicle.
 *
 * Body: `{ amount: number }` — must be strictly greater than the current bid.
 *
 * Responses:
 *   - 201 `{ vehicle, bid }`        bid accepted; vehicle reflects the new current_bid
 *   - 404 `{ error }`              unknown vehicle id
 *   - 422 `{ error, minimum }`     bid too low; `minimum` is the smallest valid amount
 */
app.post("/api/vehicles/:id/bids", (req: Request, res: Response) => {
  const amount = Number(req.body?.amount);
  const result = placeBid(String(req.params.id), amount);

  if (result === undefined) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  if (!result.ok) {
    res.status(422).json({ error: result.error, minimum: result.minimum });
    return;
  }
  res.status(201).json({ vehicle: result.vehicle, bid: result.bid });
});

app.listen(PORT, () => {
  console.log(`The Block API listening on http://localhost:${PORT}`);
});
