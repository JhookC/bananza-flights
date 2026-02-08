import {
	createContext,
	useCallback,
	useContext,
	useState,
} from "react";
import type { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

type Severity = "info" | "warning" | "error";

interface Notification {
	message: string;
	severity: Severity;
	key: number;
}

interface ApiNotificationContextValue {
	notify: (message: string, severity?: Severity) => void;
}

const ApiNotificationContext = createContext<ApiNotificationContextValue | null>(
	null,
);

export function useApiNotification() {
	const ctx = useContext(ApiNotificationContext);
	if (!ctx)
		throw new Error(
			"useApiNotification must be used within ApiNotificationProvider",
		);
	return ctx;
}

export function ApiNotificationProvider({ children }: { children: ReactNode }) {
	const [notification, setNotification] = useState<Notification | null>(null);

	const notify = useCallback((message: string, severity: Severity = "error") => {
		setNotification({ message, severity, key: Date.now() });
	}, []);

	const handleClose = () => setNotification(null);

	return (
		<ApiNotificationContext.Provider value={{ notify }}>
			{children}
			<Snackbar
				open={notification !== null}
				autoHideDuration={5000}
				onClose={handleClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				key={notification?.key}
			>
				{notification ? (
					<Alert
						onClose={handleClose}
						severity={notification.severity}
						variant="filled"
						sx={{ width: "100%" }}
					>
						{notification.message}
					</Alert>
				) : undefined}
			</Snackbar>
		</ApiNotificationContext.Provider>
	);
}
