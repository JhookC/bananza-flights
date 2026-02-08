import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useLocation } from "react-router-dom";

interface HeaderProps {
	toggleTheme: () => void;
	mode: "light" | "dark";
}

export default function Header({ toggleTheme, mode }: HeaderProps) {
	const { pathname } = useLocation();
	const isHome = pathname === "/";

	return (
		<AppBar
			position="static"
			elevation={0}
			sx={{
				bgcolor: isHome ? "primary.main" : "transparent",
				borderBottom: isHome ? 0 : 1,
				borderColor: "divider",
			}}
		>
			<Toolbar sx={{ maxWidth: 1280, width: "100%", mx: "auto" }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
					<Box
						component="img"
						src="/logo.svg"
						alt="Bananza Flights logo"
						sx={{ height: 28 }}
					/>
					<Typography
						variant="h3"
						component="span"
						sx={{ fontWeight: 700, color: "secondary.main" }}
					>
						Bananza
					</Typography>
					<Typography
						variant="h3"
						component="span"
						sx={{ fontWeight: 700, color: isHome ? "#FFFFFF" : "text.primary" }}
					>
						Flights
					</Typography>
				</Box>
				<IconButton
					onClick={toggleTheme}
					sx={{ color: isHome ? "#FFFFFF" : "text.primary" }}
				>
					{mode === "light" ? <DarkModeRounded /> : <LightModeRounded />}
				</IconButton>
			</Toolbar>
		</AppBar>
	);
}
