# Bananza Flights

A flight search engine powered by the Amadeus Self-Service API — built with React 19, TypeScript, and Material UI.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| UI | MUI 7 + Emotion |
| Build | Vite 7 |
| Server State | TanStack Query 5 |
| Forms | React Hook Form + Zod 4 |
| Charts | Recharts 3 |
| Routing | React Router 7 |
| Testing | Vitest 4 |

## Features

- **Real-time flight search** via Amadeus Self-Service API with OAuth token management
- **Client-side filtering** — stops, price range, airline, departure time — with instant updates
- **Interactive price trend chart** — click a date to select it for your search
- **Round-trip / one-way search** with schema-validated forms (Zod + React Hook Form)
- **Light/dark mode** with Navy/Gold brand theming (Montserrat)
- **Responsive layout** — 3-column desktop (filters | cards | chart), drawer-based filters on mobile
- **URL-persisted state** — searches and filters are shareable and bookmarkable
- **Recent searches** stored in localStorage for quick re-use

## Getting Started

```bash
git clone https://github.com/<your-username>/bananza-flights.git
cd bananza-flights
pnpm install
```

Create a `.env` file with your [Amadeus API](https://developers.amadeus.com/) credentials:

```env
VITE_AMADEUS_KEY=your_api_key
VITE_AMADEUS_SECRET=your_api_secret
VITE_AMADEUS_BASE_URL=https://test.api.amadeus.com
```

```bash
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Type-check and build for production |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest |
| `pnpm preview` | Preview production build |

## Project Structure

```
src/
├── pages/                  # Route-level components
│   ├── SearchPage.tsx          # Home — search form + recent searches
│   └── ResultsPage.tsx         # Flight results with filters and chart
│
├── components/
│   ├── common/             # Reusable UI components
│   │   ├── AsyncAutocomplete.tsx       # Debounced autocomplete (airports)
│   │   ├── CheckboxFilterGroup.tsx     # Multi-select checkbox filter
│   │   ├── DatePickerField.tsx         # MUI DatePicker wrapper
│   │   ├── ErrorBoundary.tsx           # React error boundary
│   │   ├── Header.tsx                  # App bar with theme toggle
│   │   ├── PassengerCounter.tsx        # +/- passenger selector
│   │   ├── PriceTrendChart.tsx         # Recharts area chart (click-to-select)
│   │   ├── RangeSlider.tsx             # Min/max range filter
│   │   ├── ResponsiveFilterPanel.tsx   # Desktop sidebar / mobile drawer
│   │   └── SortableCardList.tsx        # Card list with sort controls
│   │
│   └── flights/            # Domain-specific components
│       ├── SearchForm.tsx              # Flight search form
│       ├── FlightCard.tsx              # Individual flight result
│       ├── FlightResultsLayout.tsx     # 3-column results layout
│       └── RecentSearches.tsx          # Saved search chips
│
├── contexts/               # React Context providers
│   ├── SearchFormProvider.tsx           # Form state (React Hook Form)
│   ├── FilterContext.tsx               # Filter/sort state (useReducer + URL sync)
│   └── ApiNotificationContext.tsx      # API error/loading notifications
│
├── hooks/                  # Custom hooks
│   ├── useFlightSearch.ts              # TanStack Query — flight offers
│   ├── useAirportSearch.ts             # TanStack Query — airport autocomplete
│   ├── usePriceTrend.ts               # TanStack Query — price trend data
│   ├── useRecentSearches.ts           # localStorage recent searches
│   └── useDebounce.ts                 # Debounce utility hook
│
├── services/
│   └── amadeus.ts          # API client — OAuth token management + endpoints
│
├── schemas/
│   └── searchSchema.ts     # Zod validation for search form
│
├── utils/
│   ├── flightFilter.ts     # Pure functions — filter, sort, extract ranges
│   ├── mappers.ts          # API response → domain model mappers
│   └── popularAirports.ts  # Static airport data for suggestions
│
├── theme/
│   └── index.ts            # MUI v7 theme — Montserrat, Navy/Gold, light/dark
│
└── types/
    └── index.ts            # Shared TypeScript interfaces
```

## Architecture Highlights

**State management** — TanStack Query handles all server state (flight searches, airport lookups, price trends). Client state (active filters, sort order) lives in React Context with `useReducer`, synced bidirectionally with URL search params for shareability.

**Filtering** — All filtering and sorting happens client-side via pure functions in `flightFilter.ts`, giving instant feedback without additional API calls. Filter state is derived from the current result set (available airlines, price ranges) and applied through the reducer.

**API layer** — The Amadeus Self-Service API client handles OAuth client credentials flow with automatic token refresh. All API calls go through a single service module with typed request/response interfaces.

**Forms** — React Hook Form with a Zod resolver provides type-safe validation. The form schema defines constraints (future dates, valid IATA codes, passenger limits) and the form state is shared via context for cross-component access.

**Responsive design** — Desktop uses a 3-column layout (filter sidebar | flight cards | price chart). On mobile, filters collapse into a drawer and the chart stacks below the results.
