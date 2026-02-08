import type { Airport } from "../types/index.ts";

export const POPULAR_AIRPORTS: Airport[] = [
  { iataCode: "JFK", name: "John F Kennedy Intl", cityName: "New York", countryName: "United States" },
  { iataCode: "LAX", name: "Los Angeles Intl", cityName: "Los Angeles", countryName: "United States" },
  { iataCode: "ORD", name: "O'Hare Intl", cityName: "Chicago", countryName: "United States" },
  { iataCode: "ATL", name: "Hartsfield-Jackson Intl", cityName: "Atlanta", countryName: "United States" },
  { iataCode: "DFW", name: "Dallas/Fort Worth Intl", cityName: "Dallas", countryName: "United States" },
  { iataCode: "SFO", name: "San Francisco Intl", cityName: "San Francisco", countryName: "United States" },
  { iataCode: "MIA", name: "Miami Intl", cityName: "Miami", countryName: "United States" },
  { iataCode: "BOS", name: "Logan Intl", cityName: "Boston", countryName: "United States" },
  { iataCode: "SEA", name: "Seattle-Tacoma Intl", cityName: "Seattle", countryName: "United States" },
  { iataCode: "DEN", name: "Denver Intl", cityName: "Denver", countryName: "United States" },
  { iataCode: "LHR", name: "Heathrow", cityName: "London", countryName: "United Kingdom" },
  { iataCode: "CDG", name: "Charles de Gaulle", cityName: "Paris", countryName: "France" },
  { iataCode: "FRA", name: "Frankfurt Intl", cityName: "Frankfurt", countryName: "Germany" },
  { iataCode: "MAD", name: "Adolfo Suárez Madrid-Barajas", cityName: "Madrid", countryName: "Spain" },
  { iataCode: "MEX", name: "Benito Juárez Intl", cityName: "Mexico City", countryName: "Mexico" },
  { iataCode: "CUN", name: "Cancún Intl", cityName: "Cancún", countryName: "Mexico" },
];
