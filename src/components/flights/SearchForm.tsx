import AirlineSeatReclineNormalRounded from "@mui/icons-material/AirlineSeatReclineNormalRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import SwapHorizRounded from "@mui/icons-material/SwapHorizRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { parse } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAirportSearch } from "../../hooks/useAirportSearch.ts";
import { useRecentSearches } from "../../hooks/useRecentSearches.ts";
import type { SearchFormValues } from "../../schemas/searchSchema.ts";
import type { Airport } from "../../types/index.ts";
import { POPULAR_AIRPORTS } from "../../utils/popularAirports.ts";
import AsyncAutocomplete from "../common/AsyncAutocomplete.tsx";
import DatePickerField from "../common/DatePickerField.tsx";
import PassengerCounter from "../common/PassengerCounter.tsx";

type TripType = "oneWay" | "roundTrip";

const airportEqual = (a: Airport, b: Airport) => a.iataCode === b.iataCode;

const TRIP_OPTIONS: { value: TripType; label: string }[] = [
	{ value: "oneWay", label: "One Way" },
	{ value: "roundTrip", label: "Round Trip" },
];

export default function SearchForm() {
	const { control, handleSubmit, watch, setValue, getValues } =
		useFormContext<SearchFormValues>();
	const navigate = useNavigate();
	const { addSearch } = useRecentSearches();

	const [tripType, setTripType] = useState<TripType>("roundTrip");

	const handleTripType = (type: TripType) => {
		setTripType(type);
		if (type !== "roundTrip") {
			setValue("returnDate", "");
		}
	};

	const [originInput, setOriginInput] = useState("");
	const [destInput, setDestInput] = useState("");

	const { data: originResults = [], isLoading: originLoading } =
		useAirportSearch(originInput);
	const { data: destResults = [], isLoading: destLoading } =
		useAirportSearch(destInput);

	const origin = watch("origin");
	const destination = watch("destination");
	const departureDate = watch("departureDate");
	const returnDate = watch("returnDate");

	const isFormValid =
		origin !== null &&
		destination !== null &&
		departureDate !== "" &&
		(tripType !== "roundTrip" || returnDate !== "");

	// Clear return date if departure moves past it
	useEffect(() => {
		const returnDate = getValues("returnDate");
		if (returnDate && departureDate > returnDate) {
			setValue("returnDate", "");
		}
	}, [departureDate, getValues, setValue]);

	const onSubmit = useCallback(
		(data: SearchFormValues) => {
			if (!data.origin || !data.destination) return;

			addSearch({
				origin: {
					iataCode: data.origin.iataCode,
					cityName: data.origin.cityName,
				},
				destination: {
					iataCode: data.destination.iataCode,
					cityName: data.destination.cityName,
				},
				departureDate: data.departureDate,
				passengers: data.passengers,
			});

			const params = new URLSearchParams();
			params.set("origin", data.origin.iataCode);
			params.set("dest", data.destination.iataCode);
			params.set("date", data.departureDate);
			if (data.returnDate) params.set("return", data.returnDate);
			params.set("pax", String(data.passengers));
			params.set("class", data.travelClass);

			navigate(`/results?${params.toString()}`);
		},
		[navigate, addSearch],
	);

	const handleSwap = () => {
		const [o, d] = [getValues("origin"), getValues("destination")];
		setValue("origin", d);
		setValue("destination", o);
	};

	const renderAirportOption = (
		props: React.HTMLAttributes<HTMLLIElement> & { key: string },
		option: Airport,
	) => {
		const { key, ...rest } = props;
		return (
			<li key={key} {...rest}>
				<Box>
					<Typography fontWeight={700}>{option.iataCode}</Typography>
					<Typography variant="body2" color="text.secondary">
						{option.cityName}, {option.countryName}
					</Typography>
				</Box>
			</li>
		);
	};

	const renderAirportCard = (lbl: string) => (airport: Airport) => (
		<>
			<Typography variant="caption" color="text.secondary">
				{lbl}
			</Typography>
			<Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
				{airport.iataCode}
			</Typography>
			<Typography variant="body2" color="text.secondary">
				{airport.cityName}, {airport.countryName}
			</Typography>
		</>
	);

	return (
		<Box component="form" onSubmit={handleSubmit(onSubmit)}>
			<Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
				<Box
					sx={{
						display: "inline-flex",
						bgcolor: "action.hover",
						borderRadius: 25,
						p: 0.5,
					}}
				>
					{TRIP_OPTIONS.map((opt) => {
						const active = tripType === opt.value;
						return (
							<ButtonBase
								key={opt.value}
								onClick={() => handleTripType(opt.value)}
								sx={{
									px: 2.5,
									py: 0.75,
									borderRadius: 25,
									typography: "body2",
									fontWeight: active ? 700 : 400,
									color: active ? "text.primary" : "text.secondary",
									bgcolor: active ? "background.paper" : "transparent",
									boxShadow: active ? 1 : 0,
									transition: "all 200ms ease",
								}}
							>
								{opt.label}
							</ButtonBase>
						);
					})}
				</Box>
			</Box>

			<Grid container spacing={2} alignItems="center">
				{/* Origin + Swap + Destination */}
				<Grid size={12}>
					<Box
						sx={{
							border: 1,
							borderColor: "divider",
							borderRadius: 2,
							position: "relative",
						}}
					>
						{/* Origin */}
						<Controller
							name="origin"
							control={control}
							render={({ field, fieldState }) => (
								<AsyncAutocomplete<Airport>
									value={field.value}
									options={originResults}
									defaultOptions={POPULAR_AIRPORTS}
									loading={originLoading}
									onInputChange={setOriginInput}
									onChange={field.onChange}
									getOptionLabel={(o) => `${o.iataCode} – ${o.cityName}`}
									renderOption={renderAirportOption}
									renderSelectedDisplay={renderAirportCard("From")}
									isOptionEqualToValue={airportEqual}
									excludeValue={destination}
									label="From"
									placeholder="City or airport"
									error={fieldState.error?.message}
									sx={{
										"& .MuiOutlinedInput-notchedOutline": { border: "none" },
										"& .MuiInputLabel-shrink": { display: "none" },
									}}
								/>
							)}
						/>

						{/* Divider + Swap Button */}
						<Divider />
						<IconButton
							onClick={handleSwap}
							color="secondary"
							sx={{
								position: "absolute",
								right: 16,
								top: "50%",
								transform: "translateY(-50%)",
								zIndex: 1,
								border: 1,
								borderColor: "divider",
								bgcolor: "background.paper",
								width: 40,
								height: 40,
								"&:hover, &:active, &:focus": { bgcolor: "background.paper" },
							}}
						>
							<SwapHorizRounded fontSize="small" />
						</IconButton>

						{/* Destination */}
						<Controller
							name="destination"
							control={control}
							render={({ field, fieldState }) => (
								<AsyncAutocomplete<Airport>
									value={field.value}
									options={destResults}
									defaultOptions={POPULAR_AIRPORTS}
									loading={destLoading}
									onInputChange={setDestInput}
									onChange={field.onChange}
									getOptionLabel={(o) => `${o.iataCode} – ${o.cityName}`}
									renderOption={renderAirportOption}
									renderSelectedDisplay={renderAirportCard("To")}
									isOptionEqualToValue={airportEqual}
									excludeValue={origin}
									label="To"
									placeholder="City or airport"
									error={fieldState.error?.message}
									sx={{
										"& .MuiOutlinedInput-notchedOutline": { border: "none" },
										"& .MuiInputLabel-shrink": { display: "none" },
									}}
								/>
							)}
						/>
					</Box>
				</Grid>

				{/* Departure Date */}
				<Grid
					size={{ xs: tripType === "roundTrip" ? 6 : 12, md: "auto" }}
					sx={{ minWidth: { md: 160 } }}
				>
					<Controller
						name="departureDate"
						control={control}
						render={({ field, fieldState }) => (
							<DatePickerField
								label="Depart"
								value={field.value}
								onChange={field.onChange}
								minDate={new Date()}
								error={fieldState.error?.message}
							/>
						)}
					/>
				</Grid>

				{/* Return Date */}
				{tripType === "roundTrip" && (
					<Grid size={{ xs: 6, md: "auto" }} sx={{ minWidth: { md: 160 } }}>
						<Controller
							name="returnDate"
							control={control}
							render={({ field, fieldState }) => (
								<DatePickerField
									label="Return"
									value={field.value}
									onChange={field.onChange}
									minDate={
										departureDate
											? parse(departureDate, "yyyy-MM-dd", new Date())
											: new Date()
									}
									error={fieldState.error?.message}
								/>
							)}
						/>
					</Grid>
				)}

				{/* Passengers */}
				<Grid size={{ xs: 12, md: "auto" }} sx={{ minWidth: { md: 150 } }}>
					<Controller
						name="passengers"
						control={control}
						render={({ field }) => (
							<PassengerCounter
								label="Passengers"
								value={field.value}
								onChange={field.onChange}
							/>
						)}
					/>
				</Grid>

				{/* Travel Class */}
				<Grid size={{ xs: 12, md: "auto" }} sx={{ minWidth: { md: 160 } }}>
					<Controller
						name="travelClass"
						control={control}
						render={({ field }) => (
							<Paper
								variant="outlined"
								sx={{
									px: 1.5,
									py: 1,
									display: "flex",
									alignItems: "center",
									minHeight: 48,
									borderRadius: "10px",
								}}
							>
								<Stack
									direction="row"
									alignItems="center"
									spacing={0.75}
									sx={{ width: "100%" }}
								>
									<AirlineSeatReclineNormalRounded
										fontSize="small"
										color="action"
									/>
									<TextField
										select
										variant="standard"
										value={field.value}
										onChange={field.onChange}
										slotProps={{
											input: { disableUnderline: true },
										}}
										sx={{
											flex: 1,
											"& .MuiInput-root": {
												fontSize: "0.875rem",
												color: "text.secondary",
											},
										}}
									>
										<MenuItem value="ECONOMY">Economy</MenuItem>
										<MenuItem value="PREMIUM_ECONOMY">Premium Economy</MenuItem>
										<MenuItem value="BUSINESS">Business</MenuItem>
										<MenuItem value="FIRST">First</MenuItem>
									</TextField>
								</Stack>
							</Paper>
						)}
					/>
				</Grid>

				{/* Search Button */}
				<Grid size={{ xs: 12, md: "auto" }}>
					<Button
						type="submit"
						variant="contained"
						color="secondary"
						size="large"
						fullWidth
						disabled={!isFormValid}
						startIcon={<SearchRounded />}
						sx={{ minHeight: 48 }}
					>
						Search
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
}
