import CloseRounded from "@mui/icons-material/CloseRounded";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import TuneRounded from "@mui/icons-material/TuneRounded";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Drawer from "@mui/material/Drawer";
import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Children, useState } from "react";

export interface ActiveFilterChip {
	label: string;
	onRemove: () => void;
}

interface ResponsiveFilterPanelProps {
	children: React.ReactNode;
	onReset: () => void;
	activeFilterCount?: number;
	activeFilters?: ActiveFilterChip[];
}

export default function ResponsiveFilterPanel({
	children,
	onReset,
	activeFilterCount = 0,
	activeFilters = [],
}: ResponsiveFilterPanelProps) {
	const theme = useTheme();
	const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
	const isMedium = useMediaQuery(theme.breakpoints.between("sm", "lg"));
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [expanded, setExpanded] = useState(false);

	// Large screens: sticky sidebar
	if (isDesktop) {
		return (
			<Paper
				sx={{
					width: 260,
					flexShrink: 0,
					position: "sticky",
					top: 16,
					maxHeight: "calc(100vh - 32px)",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					sx={{ px: 2, pt: 2, pb: 1 }}
				>
					<Typography variant="h3">Filters</Typography>
					<Button size="small" onClick={onReset}>
						Reset
					</Button>
				</Stack>
				<Box sx={{ overflowY: "auto", minHeight: 0, px: 2, pb: 2 }}>
					<Stack spacing={3}>{children}</Stack>
				</Box>
			</Paper>
		);
	}

	// Medium screens: horizontal filter bar
	if (isMedium) {
		return (
			<Paper sx={{ p: 2 }}>
				<Stack
					direction="row"
					alignItems="center"
					spacing={1.5}
				>
					<Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
						<TuneRounded fontSize="small" color="action" />
						<Typography variant="h3" sx={{ whiteSpace: "nowrap" }}>
							Filters
						</Typography>
					</Stack>

					<Box
						sx={{
							flex: 1,
							minWidth: 0,
							display: "flex",
							gap: 0.75,
							overflowX: "auto",
							py: 0.5,
							"&::-webkit-scrollbar": { display: "none" },
							scrollbarWidth: "none",
						}}
					>
						{!expanded &&
							activeFilters.map((filter) => (
								<Chip
									key={filter.label}
									label={filter.label}
									size="small"
									onDelete={filter.onRemove}
									sx={{
										flexShrink: 0,
										bgcolor: "secondary.main",
										color: "primary.main",
										fontWeight: 600,
										"& .MuiChip-deleteIcon": {
											color: "primary.main",
											opacity: 0.6,
											"&:hover": { opacity: 1 },
										},
									}}
								/>
							))}
					</Box>

					<Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
						{activeFilterCount > 0 && (
							<Button size="small" onClick={onReset}>
								Reset
							</Button>
						)}
						<IconButton
							size="small"
							onClick={() => setExpanded((prev) => !prev)}
							sx={{
								transition: "transform 200ms ease",
							}}
						>
							{expanded ? <ExpandLessRounded /> : <ExpandMoreRounded />}
						</IconButton>
					</Stack>
				</Stack>

				<Collapse in={expanded} timeout={300}>
					<Box
						sx={{
							pt: 2,
							mt: 2,
							borderTop: 1,
							borderColor: "divider",
						}}
					>
						<Grid container spacing={2}>
							{Children.toArray(children).map((child, index) => (
								<Grid key={index} size={{ xs: 6 }}>
									{child}
								</Grid>
							))}
						</Grid>
						<Button
							variant="outlined"
							color="secondary"
							fullWidth
							onClick={() => setExpanded(false)}
							sx={{ mt: 2 }}
						>
							Show results
						</Button>
					</Box>
				</Collapse>
			</Paper>
		);
	}

	// Small screens: FAB + bottom drawer
	return (
		<>
			<Badge
				badgeContent={activeFilterCount}
				invisible={activeFilterCount === 0}
				sx={{
					position: "fixed",
					bottom: 24,
					right: 24,
					zIndex: theme.zIndex.fab,
					"& .MuiBadge-badge": {
						minWidth: 18,
						height: 18,
						fontSize: 11,
						fontWeight: 700,
						bgcolor: "primary.main",
						color: "common.white",
						padding: "0 4px",
					},
				}}
			>
				<Fab color="secondary" onClick={() => setDrawerOpen(true)} aria-label="Open filters">
					<TuneRounded />
				</Fab>
			</Badge>
			<Drawer
				anchor="bottom"
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				disableScrollLock
				PaperProps={{
					sx: {
						borderTopLeftRadius: 16,
						borderTopRightRadius: 16,
						maxHeight: "80vh",
						px: 3,
						py: 2,
					},
				}}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					sx={{ mb: 2 }}
				>
					<Typography variant="h3">Filters</Typography>
					<Stack direction="row" spacing={1} alignItems="center">
						<Button size="small" onClick={onReset}>
							Reset
						</Button>
						<Fab size="small" onClick={() => setDrawerOpen(false)} aria-label="Close filters">
							<CloseRounded />
						</Fab>
					</Stack>
				</Stack>
				<Box sx={{ overflowY: "auto", pb: 2 }}>
					<Stack spacing={3}>
						{children}
					</Stack>
				</Box>
				<Button
					variant="contained"
					color="secondary"
					fullWidth
					onClick={() => setDrawerOpen(false)}
					sx={{ mt: 2 }}
				>
					Show results
				</Button>
			</Drawer>
		</>
	);
}
