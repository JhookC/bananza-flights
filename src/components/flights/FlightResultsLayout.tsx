import Box from "@mui/material/Box";
import { useMemo } from "react";
import { useFilterState } from "../../contexts/FilterContext.tsx";
import type { ActiveFilterChip } from "../common/ResponsiveFilterPanel.tsx";
import type { Flight } from "../../types/index.ts";
import { formatMinutesAsTime, formatStopsLabel } from "../../utils/mappers.ts";
import CheckboxFilterGroup from "../common/CheckboxFilterGroup.tsx";
import RangeSlider from "../common/RangeSlider.tsx";
import ResponsiveFilterPanel from "../common/ResponsiveFilterPanel.tsx";
import SortableCardList from "../common/SortableCardList.tsx";
import FlightCard from "./FlightCard.tsx";

const SORT_OPTIONS = [
	{ field: "price", label: "Price" },
	{ field: "duration", label: "Duration" },
	{ field: "departureTime", label: "Departure" },
	{ field: "arrivalTime", label: "Arrival" },
	{ field: "stops", label: "Stops" },
	{ field: "airline", label: "Airline" },
];

interface FlightResultsLayoutProps {
	loading?: boolean;
}

export default function FlightResultsLayout({
	loading,
}: FlightResultsLayoutProps) {
	const { filters, sort, filteredResults, filterOptions, form, setSort, resetFilters } =
		useFilterState();
	const stopOptions = filterOptions.stopOptions.map((s) => ({
		value: s.value,
		label: s.value >= 2 ? "2+ stops" : formatStopsLabel(s.value),
	}));

	const airlineOptions = filterOptions.airlines.map((a) => ({
		value: a.code,
		label: a.name,
	}));

	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (filters.stops.length > 0) count++;
		if (
			filters.priceRange[0] !== filterOptions.priceMin ||
			filters.priceRange[1] !== filterOptions.priceMax
		)
			count++;
		if (filters.airlines.length > 0) count++;
		if (
			filters.departureTimeRange[0] !== filterOptions.departureTimeMin ||
			filters.departureTimeRange[1] !== filterOptions.departureTimeMax
		)
			count++;
		return count;
	}, [filters, filterOptions]);

	const activeFilters = useMemo<ActiveFilterChip[]>(() => {
		const chips: ActiveFilterChip[] = [];

		for (const stopVal of filters.stops) {
			const label = stopVal >= 2 ? "2+ stops" : formatStopsLabel(stopVal);
			chips.push({
				label,
				onRemove: () =>
					form.setValue(
						"stops",
						filters.stops.filter((s) => s !== stopVal),
					),
			});
		}

		if (
			filters.priceRange[0] !== filterOptions.priceMin ||
			filters.priceRange[1] !== filterOptions.priceMax
		) {
			chips.push({
				label: `$${filters.priceRange[0]} — $${filters.priceRange[1]}`,
				onRemove: () =>
					form.setValue("priceRange", [filterOptions.priceMin, filterOptions.priceMax]),
			});
		}

		for (const code of filters.airlines) {
			const airline = filterOptions.airlines.find((a) => a.code === code);
			chips.push({
				label: airline?.name ?? code,
				onRemove: () =>
					form.setValue(
						"airlines",
						filters.airlines.filter((a) => a !== code),
					),
			});
		}

		if (
			filters.departureTimeRange[0] !== filterOptions.departureTimeMin ||
			filters.departureTimeRange[1] !== filterOptions.departureTimeMax
		) {
			chips.push({
				label: `${formatMinutesAsTime(filters.departureTimeRange[0])} — ${formatMinutesAsTime(filters.departureTimeRange[1])}`,
				onRemove: () =>
					form.setValue("departureTimeRange", [
						filterOptions.departureTimeMin,
						filterOptions.departureTimeMax,
					]),
			});
		}

		return chips;
	}, [filters, filterOptions, form]);

	const filterContent = (
		<>
			<CheckboxFilterGroup
				label="Stops"
				options={stopOptions}
				selected={filters.stops}
				onChange={(v) => form.setValue("stops", v)}
			/>

			<RangeSlider
				label="Price"
				value={filters.priceRange}
				onChange={(v) => form.setValue("priceRange", v)}
				min={filterOptions.priceMin}
				max={filterOptions.priceMax}
				formatLabel={(v) => `$${v}`}
			/>

			<CheckboxFilterGroup
				label="Airlines"
				options={airlineOptions}
				selected={filters.airlines}
				onChange={(v) => form.setValue("airlines", v)}
			/>

			<RangeSlider
				label="Departure Time"
				value={filters.departureTimeRange}
				onChange={(v) => form.setValue("departureTimeRange", v)}
				min={0}
				max={1440}
				step={30}
				formatLabel={formatMinutesAsTime}
			/>
		</>
	);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: { xs: "column", lg: "row" },
				gap: 3,
				alignItems: { xs: "stretch", lg: "flex-start" },
			}}
		>
			<ResponsiveFilterPanel
				onReset={resetFilters}
				activeFilterCount={activeFilterCount}
				activeFilters={activeFilters}
			>
				{filterContent}
			</ResponsiveFilterPanel>

			<Box sx={{ flex: 1, minWidth: 0 }}>
				<SortableCardList<Flight>
					items={filteredResults}
					sortOptions={SORT_OPTIONS}
					activeSort={sort}
					onSortChange={setSort}
					renderCard={(flight) => <FlightCard flight={flight} />}
					keyExtractor={(f) => f.id}
					loading={loading}
				/>
			</Box>
		</Box>
	);
}
