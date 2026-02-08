import { z } from "zod";

const airportSchema = z.object({
	iataCode: z.string(),
	name: z.string(),
	cityName: z.string(),
	countryName: z.string(),
});

export const searchSchema = z
	.object({
		origin: airportSchema
			.nullable()
			.refine((v) => v !== null, "Origin is required"),
		destination: airportSchema
			.nullable()
			.refine((v) => v !== null, "Destination is required"),
		departureDate: z.string().min(1, "Departure date is required"),
		returnDate: z.string(),
		passengers: z.number().min(1).max(9),
		travelClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
	})
	.refine((data) => !data.returnDate || data.departureDate <= data.returnDate, {
		message: "Return must be after departure",
		path: ["returnDate"],
	});

export type SearchFormValues = z.input<typeof searchSchema>;
