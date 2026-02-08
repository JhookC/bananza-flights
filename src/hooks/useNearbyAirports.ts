import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchNearbyAirports } from "../services/amadeus.ts";
import { mapAmadeusLocation } from "../utils/mappers.ts";
import { getAirportsByProximity } from "../utils/popularAirports.ts";
import type { Airport } from "../types/index.ts";

interface GeoCoords {
  latitude: number;
  longitude: number;
}

export function useNearbyAirports() {
  const [coords, setCoords] = useState<GeoCoords | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        // Geolocation denied or unavailable — coords stays null
      },
    );
  }, []);

  return useQuery<Airport[]>({
    queryKey: ["nearbyAirports", coords?.latitude, coords?.longitude],
    queryFn: async () => {
      const response = await searchNearbyAirports(
        coords!.latitude,
        coords!.longitude,
      );
      if (response.data.length > 0) {
        return response.data.map(mapAmadeusLocation);
      }
      // Amadeus test env has limited coverage — fall back to proximity sort
      return getAirportsByProximity(coords!.latitude, coords!.longitude);
    },
    enabled: coords !== null,
    staleTime: 30 * 60 * 1000,
  });
}
