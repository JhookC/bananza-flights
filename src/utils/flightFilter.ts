import type {
	FilterState,
	Flight,
	SortConfig,
} from "../types/index.ts";

export function filterFlights(
	flights: Flight[],
	filters: FilterState,
): Flight[] {
	return flights.filter((flight) => {
		if (
			filters.stops.length > 0 &&
			!filters.stops.includes(Math.min(flight.stops, 2))
		) {
			return false;
		}

		if (
			flight.price < filters.priceRange[0] ||
			flight.price > filters.priceRange[1]
		) {
			return false;
		}

		if (
			filters.airlines.length > 0 &&
			!filters.airlines.includes(flight.airlineCode)
		) {
			return false;
		}

		const departureMinutes = getMinutesFromMidnight(flight.departureTime);
		if (
			departureMinutes < filters.departureTimeRange[0] ||
			departureMinutes > filters.departureTimeRange[1]
		) {
			return false;
		}

		return true;
	});
}

export function sortFlights(flights: Flight[], sort: SortConfig): Flight[] {
	return [...flights].sort((a, b) => {
		let comparison = 0;

		switch (sort.field) {
			case "price":
				comparison = a.price - b.price;
				break;
			case "duration":
				comparison = a.durationMinutes - b.durationMinutes;
				break;
			case "departureTime":
				comparison =
					new Date(a.departureTime).getTime() -
					new Date(b.departureTime).getTime();
				break;
			case "arrivalTime":
				comparison =
					new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
				break;
			case "stops":
				comparison = a.stops - b.stops;
				break;
			case "airline":
				comparison = a.airline.localeCompare(b.airline);
				break;
		}

		return sort.direction === "asc" ? comparison : -comparison;
	});
}

export interface FilterOptions {
	airlines: { code: string; name: string; count: number }[];
	stopOptions: { value: number; count: number }[];
	priceMin: number;
	priceMax: number;
	departureTimeMin: number;
	departureTimeMax: number;
}

export function extractFilterOptions(flights: Flight[]): FilterOptions {
	const airlineMap = new Map<string, { name: string; count: number }>();
	const stopMap = new Map<number, number>();
	let priceMin = Infinity;
	let priceMax = -Infinity;
	let departureTimeMin = 1440;
	let departureTimeMax = 0;

	for (const flight of flights) {
		const existing = airlineMap.get(flight.airlineCode);
		if (existing) {
			existing.count++;
		} else {
			airlineMap.set(flight.airlineCode, {
				name: flight.airline,
				count: 1,
			});
		}

		const stopKey = Math.min(flight.stops, 2);
		stopMap.set(stopKey, (stopMap.get(stopKey) || 0) + 1);

		priceMin = Math.min(priceMin, flight.price);
		priceMax = Math.max(priceMax, flight.price);

		const depMinutes = getMinutesFromMidnight(flight.departureTime);
		departureTimeMin = Math.min(departureTimeMin, depMinutes);
		departureTimeMax = Math.max(departureTimeMax, depMinutes);
	}

	if (!isFinite(priceMin)) priceMin = 0;
	if (!isFinite(priceMax)) priceMax = 1000;

	return {
		airlines: Array.from(airlineMap.entries())
			.map(([code, { name, count }]) => ({ code, name, count }))
			.sort((a, b) => a.name.localeCompare(b.name)),
		stopOptions: Array.from(stopMap.entries())
			.map(([value, count]) => ({ value, count }))
			.sort((a, b) => a.value - b.value),
		priceMin: Math.floor(priceMin),
		priceMax: Math.ceil(priceMax),
		departureTimeMin,
		departureTimeMax,
	};
}

function getMinutesFromMidnight(isoString: string): number {
	const date = new Date(isoString);
	return date.getHours() * 60 + date.getMinutes();
}

/**
 * Check if the user has actively narrowed any filter from its initial bounds.
 */
export function hasActiveFilters(
	filters: FilterState,
	filterOptions: FilterOptions | null,
): boolean {
	if (!filterOptions) return false;
	if (filters.stops.length > 0) return true;
	if (filters.airlines.length > 0) return true;
	if (
		filters.priceRange[0] !== filterOptions.priceMin ||
		filters.priceRange[1] !== filterOptions.priceMax
	) {
		return true;
	}
	if (
		filters.departureTimeRange[0] !== filterOptions.departureTimeMin ||
		filters.departureTimeRange[1] !== filterOptions.departureTimeMax
	) {
		return true;
	}
	return false;
}

