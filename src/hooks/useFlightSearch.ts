import { useQuery } from "@tanstack/react-query";
import type { SearchFormValues } from "../schemas/searchSchema.ts";
import { searchFlights } from "../services/amadeus.ts";
import type { Flight } from "../types/index.ts";
import { mapFlightSearchResponse } from "../utils/mappers.ts";

export function useFlightSearch(params: SearchFormValues) {
	const enabled = Boolean(
		params.origin && params.destination && params.departureDate,
	);

	return useQuery<Flight[]>({
		queryKey: [
			"flights",
			params.origin?.iataCode,
			params.destination?.iataCode,
			params.departureDate,
			params.returnDate,
			params.passengers,
			params.travelClass,
		],
		queryFn: async () => {
			const response = await searchFlights(params);
			return mapFlightSearchResponse(response);
		},
		enabled,
		staleTime: 5 * 60 * 1000,
	});
}
