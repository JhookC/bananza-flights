import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { UseFormReturn } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce.ts";
import type {
	FilterState,
	Flight,
	SortConfig,
	SortDirection,
	SortField,
} from "../types/index.ts";
import {
	extractFilterOptions,
	type FilterOptions,
	filterFlights,
	sortFlights,
} from "../utils/flightFilter.ts";

// ─── State ──────────────────────────────────────────────────────

interface FilterContextState {
	filters: FilterState;
	sort: SortConfig;
	filteredResults: Flight[];
	filterOptions: FilterOptions;
	totalResults: number;
	form: UseFormReturn<FilterState>;
	setSort: (sort: SortConfig) => void;
	resetFilters: () => void;
}

const defaultSort: SortConfig = {
	field: "price",
	direction: "asc",
};

// ─── URL Params Parsing ─────────────────────────────────────────

function parseSortFromUrl(params: URLSearchParams): Partial<SortConfig> {
	const sort: Partial<SortConfig> = {};
	const sortField = params.get("sort") as SortField | null;
	const sortDir = params.get("dir") as SortDirection | null;
	if (sortField) sort.field = sortField;
	if (sortDir) sort.direction = sortDir;
	return sort;
}

// ─── Context ────────────────────────────────────────────────────

const FilterStateContext = createContext<FilterContextState | null>(null);

interface FilterProviderProps {
	form: UseFormReturn<FilterState>;
	flights: Flight[];
	children: ReactNode;
}

export function FilterProvider({ form, flights, children }: FilterProviderProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const [sort, setSort] = useState<SortConfig>(() => {
		const urlSort = parseSortFromUrl(searchParams);
		return { ...defaultSort, ...urlSort };
	});
	const initializedRef = useRef(false);

	const filters = form.watch();

	// Mark initialized after first flight load
	useEffect(() => {
		if (flights.length > 0 && !initializedRef.current) {
			initializedRef.current = true;
		}
	}, [flights]);

	// Debounce URL updates for range sliders
	const debouncedFilters = useDebounce(filters, 300);

	// Keep a ref to current searchParams to avoid stale closures
	const searchParamsRef = useRef(searchParams);
	searchParamsRef.current = searchParams;

	// Sync state → URL
	useEffect(() => {
		if (!initializedRef.current) return;

		const params = new URLSearchParams(searchParamsRef.current);

		// Preserve non-filter params
		const origin = params.get("origin");
		const dest = params.get("dest");
		const date = params.get("date");
		const returnDate = params.get("return");
		const pax = params.get("pax");

		const newParams = new URLSearchParams();
		if (origin) newParams.set("origin", origin);
		if (dest) newParams.set("dest", dest);
		if (date) newParams.set("date", date);
		if (returnDate) newParams.set("return", returnDate);
		if (pax) newParams.set("pax", pax);

		if (debouncedFilters.stops.length > 0) {
			newParams.set("stops", debouncedFilters.stops.join(","));
		}
		newParams.set("priceMin", String(debouncedFilters.priceRange[0]));
		newParams.set("priceMax", String(debouncedFilters.priceRange[1]));
		if (debouncedFilters.airlines.length > 0) {
			newParams.set("airlines", debouncedFilters.airlines.join(","));
		}
		newParams.set("depMin", String(debouncedFilters.departureTimeRange[0]));
		newParams.set("depMax", String(debouncedFilters.departureTimeRange[1]));
		newParams.set("sort", sort.field);
		newParams.set("dir", sort.direction);

		setSearchParams(newParams, { replace: true });
	}, [debouncedFilters, sort, setSearchParams]);

	// Compute derived data
	const filterOptions = useMemo(() => extractFilterOptions(flights), [flights]);

	const filteredResults = useMemo(() => {
		const filtered = filterFlights(flights, filters);
		return sortFlights(filtered, sort);
	}, [flights, filters, sort]);

	const resetFilters = () => {
		const options = extractFilterOptions(flights);
		form.reset({
			stops: [],
			priceRange: [options.priceMin, options.priceMax],
			airlines: [],
			departureTimeRange: [options.departureTimeMin, options.departureTimeMax],
		});
	};

	const contextValue: FilterContextState = useMemo(
		() => ({
			filters,
			sort,
			filteredResults,
			filterOptions,
			totalResults: flights.length,
			form,
			setSort,
			resetFilters,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[filters, sort, filteredResults, filterOptions, flights.length, form],
	);

	return (
		<FilterStateContext.Provider value={contextValue}>
			{children}
		</FilterStateContext.Provider>
	);
}

export function useFilterState(): FilterContextState {
	const context = useContext(FilterStateContext);
	if (!context) {
		throw new Error("useFilterState must be used within FilterProvider");
	}
	return context;
}
