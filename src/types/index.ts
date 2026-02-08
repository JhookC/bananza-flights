// ─── Amadeus API Types ──────────────────────────────────────────

export interface AmadeusTokenResponse {
	type: string;
	username: string;
	application_name: string;
	client_id: string;
	token_type: string;
	access_token: string;
	expires_in: number;
	state: string;
	scope: string;
}

export interface AmadeusLocation {
	type: string;
	subType: string;
	name: string;
	detailedName: string;
	id: string;
	iataCode: string;
	address: {
		cityName: string;
		cityCode?: string;
		countryName: string;
		countryCode?: string;
		regionCode?: string;
	};
}

export interface AmadeusFlightSegment {
	departure: {
		iataCode: string;
		terminal?: string;
		at: string;
	};
	arrival: {
		iataCode: string;
		terminal?: string;
		at: string;
	};
	carrierCode: string;
	number: string;
	aircraft: { code: string };
	operating?: { carrierCode: string };
	duration: string;
	id: string;
	numberOfStops: number;
}

export interface AmadeusItinerary {
	duration: string;
	segments: AmadeusFlightSegment[];
}

export interface AmadeusFlightPrice {
	currency: string;
	total: string;
	base: string;
	grandTotal: string;
}

export interface AmadeusFlightOffer {
	type: string;
	id: string;
	source: string;
	instantTicketingRequired: boolean;
	nonHomogeneous: boolean;
	oneWay: boolean;
	lastTicketingDate: string;
	numberOfBookableSeats: number;
	itineraries: AmadeusItinerary[];
	price: AmadeusFlightPrice;
	validatingAirlineCodes: string[];
	travelerPricings: unknown[];
}

export interface AmadeusDictionaries {
	carriers: Record<string, string>;
	aircraft?: Record<string, string>;
	currencies?: Record<string, string>;
	locations?: Record<string, { cityCode: string; countryCode: string }>;
}

export interface AmadeusFlightSearchResponse {
	meta: { count: number };
	data: AmadeusFlightOffer[];
	dictionaries: AmadeusDictionaries;
}

export interface AmadeusLocationResponse {
	meta: { count: number };
	data: AmadeusLocation[];
}

// ─── App Domain Types ───────────────────────────────────────────

export interface Airport {
	iataCode: string;
	name: string;
	cityName: string;
	countryName: string;
}

export interface FlightSegment {
	departureAirport: string;
	departureTime: string;
	arrivalAirport: string;
	arrivalTime: string;
	carrierCode: string;
	flightNumber: string;
	durationMinutes: number;
	stops: number;
}

export interface Flight {
	id: string;
	airline: string;
	airlineCode: string;
	origin: string;
	destination: string;
	departureTime: string;
	arrivalTime: string;
	durationMinutes: number;
	stops: number;
	price: number;
	currency: string;
	segments: FlightSegment[];
}

// ─── Filter / Sort Types ────────────────────────────────────────

export interface FilterState {
	stops: number[];
	priceRange: [number, number];
	airlines: string[];
	departureTimeRange: [number, number]; // minutes from midnight
}

export type SortField =
	| "price"
	| "duration"
	| "departureTime"
	| "arrivalTime"
	| "stops"
	| "airline";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
	field: SortField;
	direction: SortDirection;
}

// ─── Chart Types ────────────────────────────────────────────────

export interface ChartDataPoint {
	label: string;
	value: number;
}

export type PriceTrendRange = "7d" | "30d" | "3m";

