import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
	type SearchFormValues,
	searchSchema,
} from "../schemas/searchSchema.ts";

const defaultValues: SearchFormValues = {
	origin: null,
	destination: null,
	departureDate: "",
	returnDate: "",
	passengers: 1,
	travelClass: "ECONOMY",
};

export function SearchFormProvider({ children }: { children: ReactNode }) {
	const methods = useForm<SearchFormValues>({
		resolver: zodResolver(searchSchema),
		defaultValues,
		mode: "onSubmit",
	});

	return <FormProvider {...methods}>{children}</FormProvider>;
}
