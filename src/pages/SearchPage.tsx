import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RecentSearches from "../components/flights/RecentSearches.tsx";
import SearchForm from "../components/flights/SearchForm.tsx";
import { useRecentSearches } from "../hooks/useRecentSearches.ts";

export default function SearchPage() {
	const { searches } = useRecentSearches();

	return (
		<Box>
			{/* Hero Banner */}
			<Box
				sx={{
					bgcolor: "primary.main",
					pt: { xs: 4, md: 6 },
					pb: { xs: 30, md: 34 },
					px: 2,
					textAlign: "center",
				}}
			>
				<Typography variant="h1" sx={{ color: "#FFFFFF", mb: 1 }}>
					Find Your Next Flight
				</Typography>
				<Typography variant="body1" sx={{ color: "secondary.main" }}>
					Search and compare flights at the best prices
				</Typography>
			</Box>

			{/* Content */}
			<Container
				maxWidth={false}
				sx={{
					maxWidth: 1280,
					px: { xs: 2, md: 3 },
					mt: { xs: -26, md: -30 },
					pb: { xs: 4, md: 6 },
					position: "relative",
				}}
			>
				<Paper
					elevation={3}
					sx={{
						p: { xs: 2.5, md: 4 },
						borderRadius: 3,
					}}
				>
					<SearchForm />
				</Paper>

				<Stack spacing={4} sx={{ mt: 4 }}>
					{/* Recent Searches */}
					<RecentSearches searches={searches} />
				</Stack>
			</Container>
		</Box>
	);
}
