import { describe, expect, it } from "vitest";
import { searchSchema } from "./searchSchema.ts";

const validAirport = {
  iataCode: "JFK",
  name: "John F Kennedy Intl",
  cityName: "New York",
  countryName: "United States",
};

const validRoundTrip = {
  origin: validAirport,
  destination: { ...validAirport, iataCode: "LAX", cityName: "Los Angeles" },
  departureDate: "2026-03-01",
  returnDate: "2026-03-08",
  passengers: 1,
  travelClass: "ECONOMY" as const,
};

describe("searchSchema", () => {
  it("passes valid round-trip data", () => {
    const result = searchSchema.safeParse(validRoundTrip);
    expect(result.success).toBe(true);
  });

  it("passes valid one-way (empty returnDate)", () => {
    const result = searchSchema.safeParse({
      ...validRoundTrip,
      returnDate: "",
    });
    expect(result.success).toBe(true);
  });

  it("fails when origin is null", () => {
    const result = searchSchema.safeParse({
      ...validRoundTrip,
      origin: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const originError = result.error.issues.find((i) =>
        i.path.includes("origin"),
      );
      expect(originError?.message).toBe("Origin is required");
    }
  });

  it("fails when destination is null", () => {
    const result = searchSchema.safeParse({
      ...validRoundTrip,
      destination: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const destError = result.error.issues.find((i) =>
        i.path.includes("destination"),
      );
      expect(destError?.message).toBe("Destination is required");
    }
  });

  it("fails when departureDate is empty", () => {
    const result = searchSchema.safeParse({
      ...validRoundTrip,
      departureDate: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails when returnDate is before departureDate", () => {
    const result = searchSchema.safeParse({
      ...validRoundTrip,
      departureDate: "2026-03-08",
      returnDate: "2026-03-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const returnError = result.error.issues.find((i) =>
        i.path.includes("returnDate"),
      );
      expect(returnError?.message).toBe("Return must be after departure");
    }
  });

  it("fails when passengers is 0 or 10", () => {
    const result0 = searchSchema.safeParse({
      ...validRoundTrip,
      passengers: 0,
    });
    expect(result0.success).toBe(false);

    const result10 = searchSchema.safeParse({
      ...validRoundTrip,
      passengers: 10,
    });
    expect(result10.success).toBe(false);
  });

  it("fails with invalid travelClass", () => {
    const result = searchSchema.safeParse({
      ...validRoundTrip,
      travelClass: "INVALID",
    });
    expect(result.success).toBe(false);
  });
});
