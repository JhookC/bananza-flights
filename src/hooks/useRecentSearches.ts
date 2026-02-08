import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "bananza_recent_searches";
const MAX_ENTRIES = 5;

export interface RecentSearch {
  origin: { iataCode: string; cityName: string };
  destination: { iataCode: string; cityName: string };
  departureDate: string;
  passengers: number;
  timestamp: number;
}

function getSnapshot(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentSearch[]) : [];
  } catch {
    return [];
  }
}

function getServerSnapshot(): RecentSearch[] {
  return [];
}

let cachedSnapshot = getSnapshot();

function subscribe(onStoreChange: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cachedSnapshot = getSnapshot();
      onStoreChange();
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function useRecentSearches() {
  const searches = useSyncExternalStore(subscribe, () => cachedSnapshot, getServerSnapshot);

  const addSearch = useCallback((search: Omit<RecentSearch, "timestamp">) => {
    const current = getSnapshot();

    // Dedup by origin+destination pair (newest wins)
    const filtered = current.filter(
      (s) =>
        !(s.origin.iataCode === search.origin.iataCode &&
          s.destination.iataCode === search.destination.iataCode),
    );

    const entry: RecentSearch = { ...search, timestamp: Date.now() };
    const updated = [entry, ...filtered].slice(0, MAX_ENTRIES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    cachedSnapshot = updated;
  }, []);

  return { searches, addSearch };
}
