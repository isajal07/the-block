import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { Bid, Vehicle } from "./types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "..", "data", "vehicles.json");

/**
 * In-memory store seeded from data/vehicles.json. This is a prototype, so bids
 * mutate state in memory only and reset whenever the server restarts.
 */
const vehicles = new Map<string, Vehicle>();
const bids: Bid[] = [];

function load(): void {
  const raw = readFileSync(DATA_PATH, "utf-8");
  const parsed = JSON.parse(raw) as Vehicle[];
  for (const vehicle of parsed) {
    vehicles.set(vehicle.id, { ...vehicle });
  }
}

load();

export interface VehicleQuery {
  q?: string;
  make?: string;
  sort?: "price_asc" | "price_desc" | "year_desc" | "year_asc";
  limit?: number;
  offset?: number;
}

export function listVehicles(query: VehicleQuery = {}): {
  total: number;
  items: Vehicle[];
} {
  let items = [...vehicles.values()];

  if (query.make) {
    const make = query.make.toLowerCase();
    items = items.filter((v) => v.make.toLowerCase() === make);
  }

  if (query.q) {
    const needle = query.q.toLowerCase();
    items = items.filter((v) =>
      [v.make, v.model, v.trim, v.body_style, v.city, v.selling_dealership, v.lot]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  switch (query.sort) {
    case "price_asc":
      items.sort((a, b) => a.current_bid - b.current_bid);
      break;
    case "price_desc":
      items.sort((a, b) => b.current_bid - a.current_bid);
      break;
    case "year_asc":
      items.sort((a, b) => a.year - b.year);
      break;
    case "year_desc":
      items.sort((a, b) => b.year - a.year);
      break;
  }

  const total = items.length;
  const offset = query.offset ?? 0;
  const limit = query.limit ?? total;
  return { total, items: items.slice(offset, offset + limit) };
}

export function getVehicle(id: string): Vehicle | undefined {
  return vehicles.get(id);
}

export type PlaceBidResult =
  | { ok: true; vehicle: Vehicle; bid: Bid }
  | { ok: false; error: string; minimum: number };

export function placeBid(id: string, amount: number): PlaceBidResult | undefined {
  const vehicle = vehicles.get(id);
  if (!vehicle) return undefined;

  const minimum = vehicle.current_bid + 1;
  if (!Number.isFinite(amount) || amount < minimum) {
    return { ok: false, error: "Bid must be higher than the current bid", minimum };
  }

  vehicle.current_bid = amount;
  vehicle.bid_count += 1;

  const bid: Bid = {
    id: randomUUID(),
    vehicleId: id,
    amount,
    placedAt: new Date().toISOString(),
  };
  bids.push(bid);

  return { ok: true, vehicle, bid };
}

export function getBids(id: string): Bid[] {
  return bids
    .filter((b) => b.vehicleId === id)
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export function makes(): string[] {
  return [...new Set([...vehicles.values()].map((v) => v.make))].sort();
}
