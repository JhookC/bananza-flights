import { format } from "@formkit/tempo";
import FlightRounded from "@mui/icons-material/FlightRounded";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Flight } from "../../types/index.ts";
import { formatDuration, formatStopsLabel } from "../../utils/mappers.ts";

interface FlightCardProps {
	flight: Flight;
}

const toTitleCase = (s: string) =>
	s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const dashedLineSx = {
	flex: 1,
	borderTop: "2px dashed",
	borderColor: "text.disabled",
};

export default function FlightCard({ flight }: FlightCardProps) {
	const departureDate = new Date(flight.departureTime);
	const arrivalDate = new Date(flight.arrivalTime);

	const depDateTime = format(departureDate, "MMM D · h:mm A");
	const arrDateTime = format(arrivalDate, "MMM D · h:mm A");

	const stopsLabel = formatStopsLabel(flight.stops);

	return (
		<Card sx={{ overflow: "hidden" }}>
			<CardContent
				sx={{
					p: { xs: 2.5, md: 3 },
					"&:last-child": { pb: { xs: 2.5, md: 3 } },
				}}
			>
				<Stack spacing={2.5}>
					{/* Row 1: Airline + Flight Number */}
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
					>
						<Typography variant="body1" fontWeight={600} noWrap>
							{toTitleCase(flight.airline)}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{flight.segments[0]?.flightNumber}
						</Typography>
					</Stack>

					{/* Row 2: Route visualization */}
					<Box>
						{/* IATA codes + dashed route line */}
						<Stack direction="row" alignItems="center" spacing={2}>
							<Typography
								variant="h2"
								component="span"
								sx={{ fontWeight: 700, flexShrink: 0 }}
							>
								{flight.origin}
							</Typography>

							<Box
								sx={{
									flex: 1,
									display: "flex",
									alignItems: "center",
									gap: 0.5,
								}}
							>
								<Box sx={dashedLineSx} />
								<FlightRounded
									sx={{
										fontSize: 20,
										color: "text.primary",
										transform: "rotate(90deg)",
									}}
								/>
								<Box sx={dashedLineSx} />
							</Box>

							<Typography
								variant="h2"
								component="span"
								sx={{ fontWeight: 700, flexShrink: 0 }}
							>
								{flight.destination}
							</Typography>
						</Stack>

						{/* Date + times under codes */}
						<Stack
							direction="row"
							justifyContent="space-between"
							sx={{ mt: 0.75 }}
						>
							<Typography variant="caption" color="text.secondary">
								{depDateTime}
							</Typography>
							<Typography
								variant="caption"
								color="text.secondary"
								textAlign="right"
							>
								{arrDateTime}
							</Typography>
						</Stack>
					</Box>

					{/* Row 3: Stops + Duration | Price */}
					<Divider />
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
					>
						<Typography variant="body2" color="text.secondary">
							{stopsLabel} · {formatDuration(flight.durationMinutes)}
						</Typography>
						<Typography variant="price" color="secondary.main">
							${flight.price.toFixed(2)}
						</Typography>
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
}
