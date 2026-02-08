import { format as formatTempo } from "@formkit/tempo";
import { addDays, format as formatDateFns, parse, startOfDay } from "date-fns";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFormContext, useWatch } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import PriceTrendChart from "../components/common/PriceTrendChart.tsx";
import FlightResultsLayout from "../components/flights/FlightResultsLayout.tsx";
import { FilterProvider } from "../contexts/FilterContext.tsx";
import { useDebounce } from "../hooks/useDebounce.ts";
import { useFlightSearch } from "../hooks/useFlightSearch.ts";
import { usePriceTrend } from "../hooks/usePriceTrend.ts";
import type { SearchFormValues } from "../schemas/searchSchema.ts";
import type {
	ChartDataPoint,
	FilterState,
	PriceTrendRange,
} from "../types/index.ts";
import { extractFilterOptions } from "../utils/flightFilter.ts";

const DATE_FORMAT = "yyyy-MM-dd";

const defaultFilters: FilterState = {
	stops: [],
	priceRange: [0, 10000],
	airlines: [],
	departureTimeRange: [0, 1440],
};

function parseFiltersFromUrl(params: URLSearchParams): Partial<FilterState> {
	const filters: Partial<FilterState> = {};

	const stops = params.get("stops");
	if (stops) {
		filters.stops = stops
			.split(",")
			.map(Number)
			.filter((n) => !isNaN(n));
	}

	const priceMin = params.get("priceMin");
	const priceMax = params.get("priceMax");
	if (priceMin && priceMax) {
		filters.priceRange = [Number(priceMin), Number(priceMax)];
	}

	const airlines = params.get("airlines");
	if (airlines) {
		filters.airlines = airlines.split(",");
	}

	const depMin = params.get("depMin");
	const depMax = params.get("depMax");
	if (depMin && depMax) {
		filters.departureTimeRange = [Number(depMin), Number(depMax)];
	}

	return filters;
}

export default function ResultsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const { watch, reset, setValue } = useFormContext<SearchFormValues>();
	const [trendRange, setTrendRange] = useState<PriceTrendRange>("7d");
	const [trendOpen, setTrendOpen] = useState(true);

	const origin = watch("origin");
	const destination = watch("destination");
	const departureDate = watch("departureDate");
	const returnDate = watch("returnDate");
	const passengers = watch("passengers");
	const travelClass = watch("travelClass");

	// Filter form — separate from search form
	const filterForm = useForm<FilterState>({ defaultValues: defaultFilters });
	const initializedRef = useRef(false);

	// Hydrate search form from URL params
	useEffect(() => {
		const urlOrigin = searchParams.get("origin");
		const urlDest = searchParams.get("dest");
		const urlDate = searchParams.get("date");
		const urlReturn = searchParams.get("return");
		const urlPax = searchParams.get("pax");
		const urlClass = searchParams.get("class");

		if (urlOrigin && !origin) {
			reset({
				origin: {
					iataCode: urlOrigin,
					name: urlOrigin,
					cityName: urlOrigin,
					countryName: "",
				},
				destination: urlDest
					? {
							iataCode: urlDest,
							name: urlDest,
							cityName: urlDest,
							countryName: "",
						}
					: null,
				departureDate: urlDate || "",
				returnDate: urlReturn || "",
				passengers: urlPax ? parseInt(urlPax, 10) : 1,
				travelClass:
					(urlClass as "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST") ||
					"ECONOMY",
			});
		}
	}, [searchParams, reset, origin]);

	const searchState = {
		origin,
		destination,
		departureDate,
		returnDate,
		passengers,
		travelClass,
	};

	const {
		data: flights,
		isLoading,
		isError,
		error,
		refetch,
	} = useFlightSearch(searchState);

	// Initialize filter form from flight results + URL params
	useEffect(() => {
		if (!flights || flights.length === 0) return;
		if (initializedRef.current) return;

		const options = extractFilterOptions(flights);
		const urlFilters = parseFiltersFromUrl(searchParams);

		const baseFilters: FilterState = {
			stops: [],
			priceRange: [options.priceMin, options.priceMax],
			airlines: [],
			departureTimeRange: [options.departureTimeMin, options.departureTimeMax],
		};

		filterForm.reset({ ...baseFilters, ...urlFilters });
		initializedRef.current = true;
		// Only run on flights change, not searchParams
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [flights, filterForm]);

	// Watch filter form for chart — useWatch gives stable references
	const currentFilters = useWatch({
		control: filterForm.control,
	}) as FilterState;
	const debouncedFilters = useDebounce(currentFilters, 300);
	const filterOptions = useMemo(
		() => (flights ? extractFilterOptions(flights) : null),
		[flights],
	);

	const oneWay = !returnDate;
	const { data: chartData, isLoading: trendLoading } = usePriceTrend(
		origin?.iataCode,
		destination?.iataCode,
		trendRange,
		oneWay,
		debouncedFilters,
		filterOptions,
	);

	const updateDepartureDate = (dateStr: string) => {
		setValue("departureDate", dateStr);
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set("date", dateStr);
			return next;
		});
	};

	const shiftDate = (days: number) => {
		if (!departureDate) return;
		const current = parse(departureDate, DATE_FORMAT, new Date());
		const dateStr = formatDateFns(addDays(current, days), DATE_FORMAT);
		updateDepartureDate(dateStr);
		initializedRef.current = false;
	};

	const isPrevDisabled =
		!departureDate ||
		parse(departureDate, DATE_FORMAT, new Date()) <= startOfDay(new Date());

	const handleTrendClick = (point: ChartDataPoint) => {
		updateDepartureDate(point.label);
	};

	return (
		<Container maxWidth={false} sx={{ maxWidth: 1280, py: { xs: 2, md: 4 } }}>
			<Stack spacing={3}>
				{/* Header */}
				<Stack
					direction="row"
					alignItems="center"
					spacing={1}
					sx={{ flexWrap: "wrap" }}
				>
					<Button
						startIcon={<ArrowBackRounded />}
						onClick={() => navigate("/")}
						color="inherit"
						sx={{ textTransform: "none", fontWeight: 400 }}
					>
						Back
					</Button>
					<Typography variant="h2">
						{origin?.iataCode || "---"} to {destination?.iataCode || "---"}
					</Typography>
					{departureDate && (
						<Stack direction="row" alignItems="center" spacing={0.5}>
							<Typography variant="body2" color="text.secondary">
								·
							</Typography>
							<IconButton
								size="small"
								onClick={() => shiftDate(-1)}
								disabled={isPrevDisabled}
								aria-label="Previous day"
							>
								<ChevronLeftRounded fontSize="small" />
							</IconButton>
							<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
								{formatTempo(departureDate, "MMM D")}
							</Typography>
							<IconButton
								size="small"
								onClick={() => shiftDate(1)}
								aria-label="Next day"
							>
								<ChevronRightRounded fontSize="small" />
							</IconButton>
							<Typography variant="body2" color="text.secondary">
								· {passengers} pax
							</Typography>
						</Stack>
					)}
				</Stack>

				{/* Price Trend */}
				{origin && destination && (
					<Paper
						variant="outlined"
						sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3 }}
					>
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="center"
							sx={{ mb: trendOpen ? 2 : 0 }}
						>
							<Typography variant="h3">Price Trend</Typography>
							<IconButton size="small" onClick={() => setTrendOpen((o) => !o)}>
								{trendOpen ? <ExpandLessRounded /> : <ExpandMoreRounded />}
							</IconButton>
						</Stack>
						<Collapse in={trendOpen}>
							<PriceTrendChart
								data={chartData}
								loading={trendLoading}
								onPointClick={handleTrendClick}
								range={trendRange}
								onRangeChange={setTrendRange}
							/>
						</Collapse>
					</Paper>
				)}

				{/* Loading state */}
				{isLoading && !flights && (
					<Stack spacing={2}>
						{[0, 1, 2].map((i) => (
							<Skeleton
								key={i}
								variant="rectangular"
								height={120}
								sx={{ borderRadius: "12px" }}
							/>
						))}
					</Stack>
				)}

				{/* Error state */}
				{isError && (
					<Alert
						severity="error"
						action={
							<Button color="inherit" size="small" onClick={() => refetch()}>
								Retry
							</Button>
						}
					>
						{error instanceof Error
							? error.message
							: "Failed to search flights. Please try again."}
					</Alert>
				)}

				{/* Results */}
				{flights && (
					<FilterProvider form={filterForm} flights={flights}>
						<FlightResultsLayout loading={isLoading} />
					</FilterProvider>
				)}
			</Stack>
		</Container>
	);
}
