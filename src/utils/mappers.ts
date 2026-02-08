import type {
  AmadeusFlightOffer,
  AmadeusFlightSearchResponse,
  AmadeusLocation,
  AmadeusDictionaries,
  Flight,
  FlightSegment,
  Airport,
} from "../types/index.ts";

export function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  return hours * 60 + minutes;
}

export function mapFlightOffer(
  offer: AmadeusFlightOffer,
  dictionaries: AmadeusDictionaries,
): Flight {
  const itinerary = offer.itineraries[0];
  const segments = itinerary.segments;
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const airlineCode = offer.validatingAirlineCodes[0];

  return {
    id: offer.id,
    airline: dictionaries.carriers[airlineCode] || airlineCode,
    airlineCode,
    origin: firstSegment.departure.iataCode,
    destination: lastSegment.arrival.iataCode,
    departureTime: firstSegment.departure.at,
    arrivalTime: lastSegment.arrival.at,
    durationMinutes: parseDuration(itinerary.duration),
    stops: segments.length - 1,
    price: parseFloat(offer.price.grandTotal),
    currency: offer.price.currency,
    segments: segments.map(
      (seg): FlightSegment => ({
        departureAirport: seg.departure.iataCode,
        departureTime: seg.departure.at,
        arrivalAirport: seg.arrival.iataCode,
        arrivalTime: seg.arrival.at,
        carrierCode: seg.carrierCode,
        flightNumber: `${seg.carrierCode}${seg.number}`,
        durationMinutes: parseDuration(seg.duration),
        stops: seg.numberOfStops,
      }),
    ),
  };
}

export function mapFlightSearchResponse(
  response: AmadeusFlightSearchResponse,
): Flight[] {
  return response.data.map((offer) =>
    mapFlightOffer(offer, response.dictionaries),
  );
}

export function mapAmadeusLocation(location: AmadeusLocation): Airport {
  return {
    iataCode: location.iataCode,
    name: location.name,
    cityName: location.address.cityName,
    countryName: location.address.countryName,
  };
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatMinutesAsTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";

  let hour12: number;
  if (h === 0) {
    hour12 = 12;
  } else if (h > 12) {
    hour12 = h - 12;
  } else {
    hour12 = h;
  }

  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatStopsLabel(stops: number): string {
  if (stops === 0) return "Nonstop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}
