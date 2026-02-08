import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("Uncaught error:", error, info.componentStack);
	}

	render() {
		if (this.state.hasError) {
			return (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "100vh",
						gap: 2,
						p: 3,
						textAlign: "center",
					}}
				>
					<Typography variant="h4" fontWeight={700}>
						Something went wrong
					</Typography>
					<Typography color="text.secondary">
						An unexpected error occurred. Please reload the page.
					</Typography>
					<Button
						variant="contained"
						color="secondary"
						onClick={() => window.location.reload()}
					>
						Reload
					</Button>
				</Box>
			);
		}
		return this.props.children;
	}
}
