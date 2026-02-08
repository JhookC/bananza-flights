import { describe, expect, it } from "vitest";
import type { FilterState, Flight } from "../types/index.ts";
import {
  extractFilterOptions,
  filterFlights,
  hasActiveFilters,
  sortFlights,
} from "./flightFilter.ts";

// ─── Shared Fixture ─────────────────────────────────────────────

const flights: Flight[] = [
  {
    id: "1",
    airline: "American Airlines",
    airlineCode: "AA",
    origin: "JFK",
    destination: "LAX",
    departureTime: "2026-03-01T06:00:00",
    arrivalTime: "2026-03-01T09:00:00",
    durationMinutes: 180,
    stops: 0,
    price: 250,
    currency: "USD",
    segments: [],
  },
  {
    id: "2",
    airline: "Delta Air Lines",
    airlineCode: "DL",
    origin: "JFK",
    destination: "LAX",
    departureTime: "2026-03-01T14:00:00",
    arrivalTime: "2026-03-01T19:00:00",
    durationMinutes: 300,
    stops: 1,
    price: 180.5,
    currency: "USD",
    segments: [],
  },
  {
    id: "3",
    airline: "United Airlines",
    airlineCode: "UA",
    origin: "JFK",
    destination: "LAX",
    departureTime: "2026-03-01T10:30:00",
    arrivalTime: "2026-03-01T16:30:00",
    durationMinutes: 360,
    stops: 2,
    price: 420,
    currency: "USD",
    segments: [],
  },
  {
    id: "4",
    airline: "American Airlines",
    airlineCode: "AA",
    origin: "JFK",
    destination: "LAX",
    departureTime: "2026-03-01T20:00:00",
    arrivalTime: "2026-03-02T01:00:00",
    durationMinutes: 300,
    stops: 1,
    price: 310,
    currency: "USD",
    segments: [],
  },
];

function baseFilters(): FilterState {
  return {
    stops: [],
    priceRange: [0, 1000],
    airlines: [],
    departureTimeRange: [0, 1440],
  };
}

// ─── filterFlights ──────────────────────────────────────────────

describe("filterFlights", () => {
  it("returns all flights when no filters active", () => {
    expect(filterFlights(flights, baseFilters())).toHaveLength(4);
  });

  it("filters by stops", () => {
    const result = filterFlights(flights, { ...baseFilters(), stops: [0] });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by price range", () => {
    const result = filterFlights(flights, {
      ...baseFilters(),
      priceRange: [200, 350],
    });
    expect(result.map((f) => f.id)).toEqual(["1", "4"]);
  });

  it("filters by airlines", () => {
    const result = filterFlights(flights, {
      ...baseFilters(),
      airlines: ["DL"],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filters by departure time range", () => {
    const result = filterFlights(flights, {
      ...baseFilters(),
      departureTimeRange: [360, 720], // 6:00 AM - 12:00 PM
    });
    expect(result.map((f) => f.id)).toEqual(["1", "3"]);
  });

  it("applies combined filters", () => {
    const result = filterFlights(flights, {
      stops: [1],
      priceRange: [0, 300],
      airlines: [],
      departureTimeRange: [0, 1440],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("empty stops and airlines arrays mean no filtering on those fields", () => {
    const result = filterFlights(flights, {
      stops: [],
      priceRange: [0, 1000],
      airlines: [],
      departureTimeRange: [0, 1440],
    });
    expect(result).toHaveLength(4);
  });
});

// ─── sortFlights ────────────────────────────────────────────────

describe("sortFlights", () => {
  it("sorts by price ascending", () => {
    const sorted = sortFlights(flights, { field: "price", direction: "asc" });
    expect(sorted.map((f) => f.id)).toEqual(["2", "1", "4", "3"]);
  });

  it("sorts by price descending", () => {
    const sorted = sortFlights(flights, { field: "price", direction: "desc" });
    expect(sorted.map((f) => f.id)).toEqual(["3", "4", "1", "2"]);
  });

  it("sorts by duration", () => {
    const sorted = sortFlights(flights, {
      field: "duration",
      direction: "asc",
    });
    expect(sorted.map((f) => f.id)).toEqual(["1", "2", "4", "3"]);
  });

  it("sorts by departureTime", () => {
    const sorted = sortFlights(flights, {
      field: "departureTime",
      direction: "asc",
    });
    expect(sorted.map((f) => f.id)).toEqual(["1", "3", "2", "4"]);
  });

  it("sorts by stops", () => {
    const sorted = sortFlights(flights, { field: "stops", direction: "asc" });
    expect(sorted.map((f) => f.id)).toEqual(["1", "2", "4", "3"]);
  });

  it("sorts by airline name", () => {
    const sorted = sortFlights(flights, {
      field: "airline",
      direction: "asc",
    });
    expect(sorted.map((f) => f.airline)).toEqual([
      "American Airlines",
      "American Airlines",
      "Delta Air Lines",
      "United Airlines",
    ]);
  });
});

// ─── extractFilterOptions ───────────────────────────────────────

describe("extractFilterOptions", () => {
  it("extracts correct price range with floor/ceil", () => {
    const opts = extractFilterOptions(flights);
    expect(opts.priceMin).toBe(180);
    expect(opts.priceMax).toBe(420);
  });

  it("extracts airlines sorted by name", () => {
    const opts = extractFilterOptions(flights);
    expect(opts.airlines.map((a) => a.name)).toEqual([
      "American Airlines",
      "Delta Air Lines",
      "United Airlines",
    ]);
    expect(opts.airlines.find((a) => a.code === "AA")?.count).toBe(2);
  });

  it("extracts stop options sorted by value", () => {
    const opts = extractFilterOptions(flights);
    expect(opts.stopOptions.map((s) => s.value)).toEqual([0, 1, 2]);
  });

  it("returns defaults for empty flights", () => {
    const opts = extractFilterOptions([]);
    expect(opts.priceMin).toBe(0);
    expect(opts.priceMax).toBe(1000);
    expect(opts.airlines).toEqual([]);
    expect(opts.stopOptions).toEqual([]);
  });
});

// ─── hasActiveFilters ───────────────────────────────────────────

describe("hasActiveFilters", () => {
  const opts = extractFilterOptions(flights);

  it("returns false when all defaults match", () => {
    expect(
      hasActiveFilters(
        {
          stops: [],
          priceRange: [opts.priceMin, opts.priceMax],
          airlines: [],
          departureTimeRange: [opts.departureTimeMin, opts.departureTimeMax],
        },
        opts,
      ),
    ).toBe(false);
  });

  it("returns true when stops are set", () => {
    expect(
      hasActiveFilters(
        {
          stops: [0],
          priceRange: [opts.priceMin, opts.priceMax],
          airlines: [],
          departureTimeRange: [opts.departureTimeMin, opts.departureTimeMax],
        },
        opts,
      ),
    ).toBe(true);
  });

  it("returns true when price is narrowed", () => {
    expect(
      hasActiveFilters(
        {
          stops: [],
          priceRange: [200, opts.priceMax],
          airlines: [],
          departureTimeRange: [opts.departureTimeMin, opts.departureTimeMax],
        },
        opts,
      ),
    ).toBe(true);
  });

  it("returns false when filterOptions is null", () => {
    expect(hasActiveFilters(baseFilters(), null)).toBe(false);
  });
});
