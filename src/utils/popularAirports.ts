import type { Airport } from "../types/index.ts";

interface AirportWithCoords extends Airport {
  lat: number;
  lng: number;
}

const AIRPORTS_WITH_COORDS: AirportWithCoords[] = [
  { iataCode: "JFK", name: "John F Kennedy Intl", cityName: "New York", countryName: "United States", lat: 40.6413, lng: -73.7781 },
  { iataCode: "LAX", name: "Los Angeles Intl", cityName: "Los Angeles", countryName: "United States", lat: 33.9425, lng: -118.4081 },
  { iataCode: "ORD", name: "O'Hare Intl", cityName: "Chicago", countryName: "United States", lat: 41.9742, lng: -87.9073 },
  { iataCode: "ATL", name: "Hartsfield-Jackson Intl", cityName: "Atlanta", countryName: "United States", lat: 33.6407, lng: -84.4277 },
  { iataCode: "DFW", name: "Dallas/Fort Worth Intl", cityName: "Dallas", countryName: "United States", lat: 32.8998, lng: -97.0403 },
  { iataCode: "SFO", name: "San Francisco Intl", cityName: "San Francisco", countryName: "United States", lat: 37.6213, lng: -122.3790 },
  { iataCode: "MIA", name: "Miami Intl", cityName: "Miami", countryName: "United States", lat: 25.7959, lng: -80.2870 },
  { iataCode: "BOS", name: "Logan Intl", cityName: "Boston", countryName: "United States", lat: 42.3656, lng: -71.0096 },
  { iataCode: "SEA", name: "Seattle-Tacoma Intl", cityName: "Seattle", countryName: "United States", lat: 47.4502, lng: -122.3088 },
  { iataCode: "DEN", name: "Denver Intl", cityName: "Denver", countryName: "United States", lat: 39.8561, lng: -104.6737 },
  { iataCode: "LHR", name: "Heathrow", cityName: "London", countryName: "United Kingdom", lat: 51.4700, lng: -0.4543 },
  { iataCode: "CDG", name: "Charles de Gaulle", cityName: "Paris", countryName: "France", lat: 49.0097, lng: 2.5479 },
  { iataCode: "FRA", name: "Frankfurt Intl", cityName: "Frankfurt", countryName: "Germany", lat: 50.0379, lng: 8.5622 },
  { iataCode: "MAD", name: "Adolfo Suárez Madrid-Barajas", cityName: "Madrid", countryName: "Spain", lat: 40.4983, lng: -3.5676 },
  { iataCode: "MEX", name: "Benito Juárez Intl", cityName: "Mexico City", countryName: "Mexico", lat: 19.4363, lng: -99.0721 },
  { iataCode: "CUN", name: "Cancún Intl", cityName: "Cancún", countryName: "Mexico", lat: 21.0365, lng: -86.8771 },
];

function toAirport(a: AirportWithCoords): Airport {
  return { iataCode: a.iataCode, name: a.name, cityName: a.cityName, countryName: a.countryName };
}

export const POPULAR_AIRPORTS: Airport[] = AIRPORTS_WITH_COORDS.map(toAirport);

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getAirportsByProximity(lat: number, lng: number): Airport[] {
  return [...AIRPORTS_WITH_COORDS]
    .sort(
      (a, b) =>
        haversineDistance(lat, lng, a.lat, a.lng) -
        haversineDistance(lat, lng, b.lat, b.lng),
    )
    .map(toAirport);
}
