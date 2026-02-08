import ArrowDownwardRounded from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRounded from "@mui/icons-material/ArrowUpwardRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import FlightRounded from "@mui/icons-material/FlightRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { SortConfig, SortDirection } from "../../types/index.ts";

interface SortOption {
	field: string;
	label: string;
}

const PAGE_SIZE = 10;

interface SortableCardListProps<T> {
	items: T[];
	sortOptions: SortOption[];
	activeSort: SortConfig;
	onSortChange: (sort: SortConfig) => void;
	renderCard: (item: T) => React.ReactNode;
	keyExtractor: (item: T) => string;
	loading?: boolean;
}

export default function SortableCardList<T>({
	items,
	sortOptions,
	activeSort,
	onSortChange,
	renderCard,
	keyExtractor,
	loading,
}: SortableCardListProps<T>) {
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const [prevItems, setPrevItems] = useState(items);

	// Reset visible count when items change (filters/sort)
	if (items !== prevItems) {
		setPrevItems(items);
		setVisibleCount(PAGE_SIZE);
	}

	const visibleItems = items.slice(0, visibleCount);
	const hasMore = visibleCount < items.length;

	const handleSortClick = (field: string) => {
		const newDirection: SortDirection =
			activeSort.field === field && activeSort.direction === "asc"
				? "desc"
				: "asc";
		onSortChange({
			field: field as SortConfig["field"],
			direction: newDirection,
		});
	};

	return (
		<Box sx={{ minWidth: 0 }}>
			{items.length > 0 && (
				<>
					<Box
						sx={{
							display: "flex",
							flexWrap: { xs: "nowrap", sm: "wrap" },
							gap: 1,
							mb: 1,
							overflowX: { xs: "auto", sm: "visible" },
							"&::-webkit-scrollbar": { display: "none" },
							scrollbarWidth: "none",
						}}
					>
						{sortOptions.map((option) => {
							const isActive = activeSort.field === option.field;
							const DirectionIcon =
								activeSort.direction === "asc"
									? ArrowUpwardRounded
									: ArrowDownwardRounded;
							return (
								<Chip
									key={option.field}
									label={option.label}
									onClick={() => handleSortClick(option.field)}
									icon={
										isActive ? (
											<DirectionIcon sx={{ fontSize: 16, color: "inherit" }} />
										) : undefined
									}
									variant={isActive ? "filled" : "outlined"}
									sx={{
										flexShrink: 0,
										...(isActive && {
											bgcolor: "secondary.main",
											color: "primary.main",
											"&:hover": { bgcolor: "secondary.dark" },
										}),
									}}
								/>
							);
						})}
					</Box>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ mb: 1.5, display: "block" }}
					>
						Showing {Math.min(visibleCount, items.length)} of {items.length}
					</Typography>
				</>
			)}

			{loading ? (
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
			) : items.length === 0 ? (
				<Box
					sx={{
						textAlign: "center",
						py: 8,
						px: 2,
					}}
				>
					<FlightRounded
						sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
					/>
					<Typography variant="h3" gutterBottom>
						No flights found
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Try adjusting your filters or search criteria
					</Typography>
				</Box>
			) : (
				<Stack spacing={2}>
					{visibleItems.map((item) => (
						<Box key={keyExtractor(item)}>{renderCard(item)}</Box>
					))}
					{hasMore && (
						<Button
							variant="text"
							color="inherit"
							endIcon={<ExpandMoreRounded />}
							onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
							sx={{ alignSelf: "center" }}
						>
							Show more
						</Button>
					)}
				</Stack>
			)}
		</Box>
	);
}
