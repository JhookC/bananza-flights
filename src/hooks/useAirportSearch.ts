import { useQuery } from "@tanstack/react-query";
import { searchAirports } from "../services/amadeus.ts";
import { mapAmadeusLocation } from "../utils/mappers.ts";
import { useDebounce } from "./useDebounce.ts";
import type { Airport } from "../types/index.ts";

export function useAirportSearch(keyword: string) {
  const debouncedKeyword = useDebounce(keyword, 300);

  return useQuery<Airport[]>({
    queryKey: ["airports", debouncedKeyword],
    queryFn: async () => {
      const response = await searchAirports(debouncedKeyword);
      return response.data.map(mapAmadeusLocation);
    },
    enabled: debouncedKeyword.length >= 2,
    staleTime: 10 * 60 * 1000,
  });
}
