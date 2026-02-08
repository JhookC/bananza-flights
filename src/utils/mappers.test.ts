import { describe, expect, it } from "vitest";
import type {
  AmadeusDictionaries,
  AmadeusFlightOffer,
  AmadeusFlightSearchResponse,
  AmadeusLocation,
} from "../types/index.ts";
import {
  formatDuration,
  formatMinutesAsTime,
  formatStopsLabel,
  mapAmadeusLocation,
  mapFlightOffer,
  mapFlightSearchResponse,
  parseDuration,
} from "./mappers.ts";

// ─── parseDuration ──────────────────────────────────────────────

describe("parseDuration", () => {
  it("parses hours and minutes", () => {
    expect(parseDuration("PT2H30M")).toBe(150);
  });

  it("parses minutes only", () => {
    expect(parseDuration("PT45M")).toBe(45);
  });

  it("parses hours only", () => {
    expect(parseDuration("PT3H")).toBe(180);
  });

  it("parses zero duration", () => {
    expect(parseDuration("PT0H0M")).toBe(0);
  });

  it("returns 0 for invalid input", () => {
    expect(parseDuration("invalid")).toBe(0);
  });
});

// ─── mapFlightOffer ─────────────────────────────────────────────

function buildOffer(
  overrides: Partial<AmadeusFlightOffer> = {},
): AmadeusFlightOffer {
  return {
    type: "flight-offer",
    id: "1",
    source: "GDS",
    instantTicketingRequired: false,
    nonHomogeneous: false,
    oneWay: false,
    lastTicketingDate: "2026-03-01",
    numberOfBookableSeats: 5,
    itineraries: [
      {
        duration: "PT2H30M",
        segments: [
          {
            departure: { iataCode: "JFK", at: "2026-03-01T08:00:00" },
            arrival: { iataCode: "ORD", at: "2026-03-01T10:30:00" },
            carrierCode: "AA",
            number: "100",
            aircraft: { code: "738" },
            duration: "PT2H30M",
            id: "1",
            numberOfStops: 0,
          },
        ],
      },
    ],
    price: { currency: "USD", total: "250.00", base: "200.00", grandTotal: "250.00" },
    validatingAirlineCodes: ["AA"],
    travelerPricings: [],
    ...overrides,
  };
}

const dictionaries: AmadeusDictionaries = {
  carriers: { AA: "American Airlines", UA: "United Airlines" },
};

describe("mapFlightOffer", () => {
  it("maps all fields correctly for a direct flight", () => {
    const flight = mapFlightOffer(buildOffer(), dictionaries);

    expect(flight.id).toBe("1");
    expect(flight.airline).toBe("American Airlines");
    expect(flight.airlineCode).toBe("AA");
    expect(flight.origin).toBe("JFK");
    expect(flight.destination).toBe("ORD");
    expect(flight.departureTime).toBe("2026-03-01T08:00:00");
    expect(flight.arrivalTime).toBe("2026-03-01T10:30:00");
    expect(flight.durationMinutes).toBe(150);
    expect(flight.stops).toBe(0);
    expect(flight.price).toBe(250);
    expect(flight.currency).toBe("USD");
  });

  it("uses airline code as fallback when carrier not in dictionaries", () => {
    const offer = buildOffer({ validatingAirlineCodes: ["DL"] });
    const flight = mapFlightOffer(offer, dictionaries);
    expect(flight.airline).toBe("DL");
  });

  it("calculates stops from segment count", () => {
    const offer = buildOffer({
      itineraries: [
        {
          duration: "PT5H",
          segments: [
            {
              departure: { iataCode: "JFK", at: "2026-03-01T08:00:00" },
              arrival: { iataCode: "ORD", at: "2026-03-01T10:00:00" },
              carrierCode: "AA",
              number: "100",
              aircraft: { code: "738" },
              duration: "PT2H",
              id: "1",
              numberOfStops: 0,
            },
            {
              departure: { iataCode: "ORD", at: "2026-03-01T11:00:00" },
              arrival: { iataCode: "LAX", at: "2026-03-01T13:00:00" },
              carrierCode: "AA",
              number: "200",
              aircraft: { code: "738" },
              duration: "PT3H",
              id: "2",
              numberOfStops: 0,
            },
          ],
        },
      ],
    });
    const flight = mapFlightOffer(offer, dictionaries);
    expect(flight.stops).toBe(1);
    expect(flight.origin).toBe("JFK");
    expect(flight.destination).toBe("LAX");
  });

  it("formats segment flightNumber correctly", () => {
    const flight = mapFlightOffer(buildOffer(), dictionaries);
    expect(flight.segments[0].flightNumber).toBe("AA100");
  });
});

// ─── mapFlightSearchResponse ────────────────────────────────────

describe("mapFlightSearchResponse", () => {
  it("maps array of offers to flights", () => {
    const response: AmadeusFlightSearchResponse = {
      meta: { count: 2 },
      data: [buildOffer({ id: "1" }), buildOffer({ id: "2" })],
      dictionaries,
    };
    const flights = mapFlightSearchResponse(response);
    expect(flights).toHaveLength(2);
    expect(flights[0].id).toBe("1");
    expect(flights[1].id).toBe("2");
  });

  it("returns empty array for empty data", () => {
    const response: AmadeusFlightSearchResponse = {
      meta: { count: 0 },
      data: [],
      dictionaries,
    };
    expect(mapFlightSearchResponse(response)).toEqual([]);
  });
});

// ─── mapAmadeusLocation ─────────────────────────────────────────

describe("mapAmadeusLocation", () => {
  it("maps location to Airport", () => {
    const location: AmadeusLocation = {
      type: "location",
      subType: "AIRPORT",
      name: "John F Kennedy Intl",
      detailedName: "NEW YORK/JOHN F KENNEDY INTL",
      id: "AJFK",
      iataCode: "JFK",
      address: {
        cityName: "New York",
        countryName: "United States",
      },
    };
    const airport = mapAmadeusLocation(location);
    expect(airport).toEqual({
      iataCode: "JFK",
      name: "John F Kennedy Intl",
      cityName: "New York",
      countryName: "United States",
    });
  });
});

// ─── formatDuration ─────────────────────────────────────────────

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(150)).toBe("2h 30m");
  });

  it("formats minutes only", () => {
    expect(formatDuration(45)).toBe("45m");
  });

  it("formats hours only", () => {
    expect(formatDuration(180)).toBe("3h");
  });

  it("formats zero", () => {
    expect(formatDuration(0)).toBe("0m");
  });
});

// ─── formatMinutesAsTime ────────────────────────────────────────

describe("formatMinutesAsTime", () => {
  it("formats midnight", () => {
    expect(formatMinutesAsTime(0)).toBe("12:00 AM");
  });

  it("formats noon", () => {
    expect(formatMinutesAsTime(720)).toBe("12:00 PM");
  });

  it("formats afternoon", () => {
    expect(formatMinutesAsTime(810)).toBe("1:30 PM");
  });

  it("formats last minute of day", () => {
    expect(formatMinutesAsTime(1439)).toBe("11:59 PM");
  });
});

// ─── formatStopsLabel ───────────────────────────────────────────

describe("formatStopsLabel", () => {
  it("returns Nonstop for 0", () => {
    expect(formatStopsLabel(0)).toBe("Nonstop");
  });

  it("returns singular for 1", () => {
    expect(formatStopsLabel(1)).toBe("1 stop");
  });

  it("returns plural for 3", () => {
    expect(formatStopsLabel(3)).toBe("3 stops");
  });
});
