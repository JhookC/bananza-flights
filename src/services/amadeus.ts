import type { SearchFormValues } from "../schemas/searchSchema.ts";
import type {
	AmadeusFlightSearchResponse,
	AmadeusLocationResponse,
	AmadeusTokenResponse,
	Flight,
} from "../types/index.ts";
import { mapFlightSearchResponse } from "../utils/mappers.ts";

const BASE_URL = import.meta.env.VITE_AMADEUS_BASE_URL;
const API_KEY = import.meta.env.VITE_AMADEUS_KEY;
const API_SECRET = import.meta.env.VITE_AMADEUS_SECRET;

if (!BASE_URL || !API_KEY || !API_SECRET) {
	console.error(
		"Missing required environment variables: VITE_AMADEUS_BASE_URL, VITE_AMADEUS_KEY, VITE_AMADEUS_SECRET",
	);
}

// ─── Notification Interceptor ───────────────────────────────────

type NotifyFn = (message: string, severity?: "info" | "warning" | "error") => void;
let notifyFn: NotifyFn | null = null;

export function setApiNotifier(fn: NotifyFn): void {
	notifyFn = fn;
}

// ─── Token Management ───────────────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getAccessToken(): Promise<string> {
	const now = Date.now();
	if (cachedToken && now < tokenExpiresAt) {
		return cachedToken;
	}

	const response = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "client_credentials",
			client_id: API_KEY,
			client_secret: API_SECRET,
		}),
	});

	if (!response.ok) {
		notifyFn?.("Something went wrong on our end. Please try again later.", "error");
		throw new Error(`Token request failed: ${response.status}`);
	}

	const data: AmadeusTokenResponse = await response.json();
	cachedToken = data.access_token;
	tokenExpiresAt = now + (data.expires_in - 60) * 1000;
	return cachedToken;
}

// ─── Request Queue (throttle to avoid 429s) ────────────────────

const MIN_INTERVAL_MS = 150;
let lastRequestTime = 0;
let queuePromise = Promise.resolve();

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
	queuePromise = queuePromise.then(async () => {
		const elapsed = Date.now() - lastRequestTime;
		if (elapsed < MIN_INTERVAL_MS) {
			await wait(MIN_INTERVAL_MS - elapsed);
		}
		lastRequestTime = Date.now();
	});
	return queuePromise.then(fn);
}

// ─── Generic Request Helper ─────────────────────────────────────

const MAX_RETRIES = 2;

async function amadeusGet<T>(
	path: string,
	params: Record<string, string>,
): Promise<T> {
	return enqueue(() => amadeusRequest<T>(path, params));
}

function friendlyError(status: number): string {
	if (status === 429) return "Flight search is busy — please wait a moment and try again.";
	if (status === 401) return "Something went wrong on our end. Please try again later.";
	if (status >= 500) return "Flight data is temporarily unavailable — try again shortly.";
	return "Couldn't load flight results — please try again.";
}

async function amadeusRequest<T>(
	path: string,
	params: Record<string, string>,
	attempt = 0,
): Promise<T> {
	const token = await getAccessToken();
	const query = new URLSearchParams(params).toString();
	const response = await fetch(`${BASE_URL}${path}?${query}`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (response.status === 429 && attempt < MAX_RETRIES) {
		const retryAfter = response.headers.get("Retry-After");
		const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000 * 2 ** attempt;
		notifyFn?.("Taking a little longer than usual — hang tight…", "info");
		await wait(delay);
		return amadeusRequest<T>(path, params, attempt + 1);
	}

	if (!response.ok) {
		const errorBody = await response.text();
		const friendly = friendlyError(response.status);
		notifyFn?.(friendly, "error");
		throw new Error(`Amadeus API error ${response.status}: ${errorBody}`);
	}

	return response.json();
}

// ─── Endpoints ──────────────────────────────────────────────────

export async function searchFlights(
	params: SearchFormValues,
): Promise<AmadeusFlightSearchResponse> {
	const queryParams: Record<string, string> = {
		originLocationCode: params.origin!.iataCode,
		destinationLocationCode: params.destination!.iataCode,
		departureDate: params.departureDate,
		adults: String(params.passengers),
		nonStop: "false",
		max: "50",
		currencyCode: "USD",
		travelClass: params.travelClass,
	};

	if (params.returnDate) {
		queryParams.returnDate = params.returnDate;
	}

	return amadeusGet<AmadeusFlightSearchResponse>(
		"/v2/shopping/flight-offers",
		queryParams,
	);
}

export async function searchAirports(
	keyword: string,
): Promise<AmadeusLocationResponse> {
	return amadeusGet<AmadeusLocationResponse>("/v1/reference-data/locations", {
		subType: "AIRPORT",
		keyword,
		"page[limit]": "7",
		sort: "analytics.travelers.score",
		view: "LIGHT",
	});
}

export async function fetchFlightsForDate(
	origin: string,
	destination: string,
	date: string,
	oneWay: boolean,
): Promise<Flight[]> {
	const params: Record<string, string> = {
		originLocationCode: origin,
		destinationLocationCode: destination,
		departureDate: date,
		adults: "1",
		nonStop: "false",
		max: "10",
		currencyCode: "USD",
	};
	if (!oneWay) {
		params.returnDate = date;
	}
	const response = await amadeusGet<AmadeusFlightSearchResponse>(
		"/v2/shopping/flight-offers",
		params,
	);
	return mapFlightSearchResponse(response);
}
