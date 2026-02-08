import { format } from "@formkit/tempo";
import FlightTakeoffRounded from "@mui/icons-material/FlightTakeoffRounded";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import type { RecentSearch } from "../../hooks/useRecentSearches.ts";
import type { SearchFormValues } from "../../schemas/searchSchema.ts";

interface RecentSearchesProps {
	searches: RecentSearch[];
}

export default function RecentSearches({ searches }: RecentSearchesProps) {
	const navigate = useNavigate();
	const { setValue } = useFormContext<SearchFormValues>();

	const handleClick = useCallback(
		(search: RecentSearch) => {
			setValue("origin", {
				iataCode: search.origin.iataCode,
				name: search.origin.iataCode,
				cityName: search.origin.cityName,
				countryName: "",
			});
			setValue("destination", {
				iataCode: search.destination.iataCode,
				name: search.destination.iataCode,
				cityName: search.destination.cityName,
				countryName: "",
			});
			setValue("departureDate", search.departureDate);
			setValue("passengers", search.passengers);

			const params = new URLSearchParams();
			params.set("origin", search.origin.iataCode);
			params.set("dest", search.destination.iataCode);
			params.set("date", search.departureDate);
			params.set("pax", String(search.passengers));
			navigate(`/results?${params.toString()}`);
		},
		[setValue, navigate],
	);

	if (searches.length === 0) return null;

	return (
		<Box>
			<Typography variant="h3" sx={{ mb: 2 }}>
				Recent Searches
			</Typography>
			<Box
				sx={{
					display: "flex",
					gap: 2,
					overflowX: "auto",
					pb: 1,
					// Hide scrollbar
					scrollbarWidth: "none",
					"&::-webkit-scrollbar": { display: "none" },
				}}
			>
				{searches.map((search) => (
					<Paper
						key={`${search.origin.iataCode}-${search.destination.iataCode}`}
						variant="outlined"
						onClick={() => handleClick(search)}
						sx={{
							p: 2,
							minWidth: 180,
							cursor: "pointer",
							flexShrink: 0,
							transition: "transform 200ms ease, box-shadow 200ms ease",
							"&:hover": {
								transform: "translateY(-2px)",
								boxShadow: 2,
							},
						}}
					>
						<Stack spacing={1}>
							<Stack direction="row" alignItems="center" spacing={1}>
								<FlightTakeoffRounded
									sx={{ fontSize: 16, color: "secondary.main" }}
								/>
								<Typography variant="body1" fontWeight={700}>
									{search.origin.iataCode} → {search.destination.iataCode}
								</Typography>
							</Stack>
							<Typography variant="caption" color="text.secondary" noWrap>
								{search.origin.cityName} → {search.destination.cityName}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{format(search.departureDate, "MMM D")} · {search.passengers}{" "}
								pax
							</Typography>
						</Stack>
					</Paper>
				))}
			</Box>
		</Box>
	);
}
