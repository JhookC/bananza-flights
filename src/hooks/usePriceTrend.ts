import { useQueries } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { fetchFlightsForDate } from "../services/amadeus.ts";
import type {
	ChartDataPoint,
	FilterState,
	Flight,
	PriceTrendRange,
} from "../types/index.ts";
import {
	type FilterOptions,
	filterFlights,
	hasActiveFilters,
} from "../utils/flightFilter.ts";

const RANGE_CONFIG: Record<PriceTrendRange, { points: number; spacing: number }> = {
	"7d": { points: 7, spacing: 1 },
	"30d": { points: 6, spacing: 5 },
	"3m": { points: 6, spacing: 15 },
};

function computeDatePoints(range: PriceTrendRange): string[] {
	const { points, spacing } = RANGE_CONFIG[range];
	const start = addDays(new Date(), 1);
	return Array.from({ length: points }, (_, i) =>
		format(addDays(start, i * spacing), "yyyy-MM-dd"),
	);
}

interface PriceTrendResult {
	data: ChartDataPoint[];
	isLoading: boolean;
}

export function usePriceTrend(
	origin: string | undefined,
	destination: string | undefined,
	range: PriceTrendRange,
	oneWay: boolean,
	filters: FilterState,
	filterOptions: FilterOptions | null,
): PriceTrendResult {
	const enabled = Boolean(origin && destination);
	const filtersActive = hasActiveFilters(filters, filterOptions);

	const datePoints = useMemo(() => computeDatePoints(range), [range]);

	const combine = useCallback(
		(results: { data: Flight[] | undefined; isLoading: boolean }[]) => ({
			data: results.map((r) => r.data),
			settled: results.every((r) => !r.isLoading),
		}),
		[],
	);

	const queries = useQueries({
		queries: datePoints.map((date) => ({
			queryKey: [
				"flight-offers-date",
				origin,
				destination,
				date,
				oneWay,
			],
			queryFn: () =>
				fetchFlightsForDate(
					origin as string,
					destination as string,
					date,
					oneWay,
				),
			enabled,
			staleTime: 30 * 60 * 1000,
			retry: 2,
			retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10000),
		})),
		combine,
	});

	const isLoading = enabled && !queries.settled;

	const freshData = useMemo<ChartDataPoint[] | null>(() => {
		if (isLoading) return null;

		const points: ChartDataPoint[] = [];
		for (let i = 0; i < datePoints.length; i++) {
			const date = datePoints[i];
			const flights = queries.data[i];

			if (flights && flights.length > 0) {
				const relevant = filtersActive
					? filterFlights(flights, filters)
					: flights;
				if (relevant.length > 0) {
					points.push({
						label: date,
						value: Math.min(...relevant.map((f) => f.price)),
					});
				}
			}
		}
		return points;
	}, [isLoading, filtersActive, datePoints, queries.data, filters]);

	// Preserve previous data while loading so the chart stays mounted
	const [prevData, setPrevData] = useState<ChartDataPoint[]>([]);
	if (freshData !== null && freshData !== prevData) {
		setPrevData(freshData);
	}
	const data = freshData ?? prevData;

	return { data, isLoading };
}
