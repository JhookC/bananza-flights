import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm, FormProvider } from "react-hook-form";
import { MemoryRouter } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { SearchFormValues } from "../../schemas/searchSchema.ts";
import SearchForm from "./SearchForm.tsx";

vi.mock("../../hooks/useAirportSearch.ts", () => ({
  useAirportSearch: () => ({ data: [], isLoading: false }),
}));

vi.mock("../../hooks/useRecentSearches.ts", () => ({
  useRecentSearches: () => ({ searches: [], addSearch: vi.fn() }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const methods = useForm<SearchFormValues>({
    defaultValues: {
      origin: null,
      destination: null,
      departureDate: "",
      returnDate: "",
      passengers: 1,
      travelClass: "ECONOMY",
    },
  });

  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <FormProvider {...methods}>{children}</FormProvider>
        </LocalizationProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

function renderSearchForm() {
  const { container } = render(
    <Wrapper>
      <SearchForm />
    </Wrapper>,
  );
  return within(container);
}

describe("SearchForm", () => {
  it("renders without crashing", () => {
    const view = renderSearchForm();
    expect(view.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("search button is disabled when form is empty", () => {
    const view = renderSearchForm();
    expect(view.getByRole("button", { name: /search/i })).toBeDisabled();
  });
});
