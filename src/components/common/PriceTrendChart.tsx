import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import MuiTooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback, useMemo, useRef, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Tooltip,
	XAxis,
} from "recharts";
import type { ChartDataPoint, PriceTrendRange } from "../../types/index.ts";

interface PriceTrendChartProps {
	data: ChartDataPoint[];
	onPointClick?: (point: ChartDataPoint) => void;
	loading?: boolean;
	range: PriceTrendRange;
	onRangeChange: (range: PriceTrendRange) => void;
}

const RANGE_OPTIONS: { value: PriceTrendRange; label: string }[] = [
	{ value: "7d", label: "7 Days" },
	{ value: "30d", label: "30 Days" },
	{ value: "3m", label: "3 Months" },
];

const GRADIENT_ID = "priceTrendGradient";
const STROKE_COLOR = "#FBCB46";

export default function PriceTrendChart({
	data,
	onPointClick,
	loading,
	range,
	onRangeChange,
}: PriceTrendChartProps) {
	const theme = useTheme();

	// Track container size so we can pass explicit dimensions to AreaChart
	// (avoids ResponsiveContainer's -1 dimension warning inside Collapse)
	const observerRef = useRef<ResizeObserver | null>(null);
	const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
	const containerRef = useCallback((el: HTMLDivElement | null) => {
		observerRef.current?.disconnect();
		observerRef.current = null;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			setChartSize((prev) =>
				prev.width === width && prev.height === height ? prev : { width, height },
			);
		});
		observer.observe(el);
		observerRef.current = observer;
	}, []);

	const { lowestPrice, trendPercent, trendDirection } = useMemo(() => {
		if (data.length < 2)
			return {
				lowestPrice: 0,
				trendPercent: 0,
				trendDirection: "neutral" as const,
			};

		const lowest = Math.min(...data.map((d) => d.value));
		const first = data[0].value;
		const percent =
			first === 0 ? 0 : Math.abs(((lowest - first) / first) * 100);

		let direction: "down" | "up" | "neutral";
		if (lowest < first) {
			direction = "down";
		} else if (lowest > first) {
			direction = "up";
		} else {
			direction = "neutral";
		}

		return {
			lowestPrice: lowest,
			trendPercent: percent,
			trendDirection: direction,
		};
	}, [data]);

	// Derive chart key from range + data content so any data change triggers fresh animation
	const chartKey = useMemo(
		() => `${range}-${data.map((d) => d.value).join(",")}`,
		[range, data],
	);

	const handleRangeChange = (
		_: React.MouseEvent<HTMLElement>,
		newRange: PriceTrendRange | null,
	) => {
		if (newRange) onRangeChange(newRange);
	};

	// Memoize Recharts callbacks & objects to prevent unnecessary internal recalculations
	const handleChartClick = useCallback(
		(e: Record<string, unknown>) => {
			const payload = e?.activePayload as
				| { payload: ChartDataPoint }[]
				| undefined;
			if (payload?.[0] && onPointClick) {
				onPointClick(payload[0].payload);
			}
		},
		[onPointClick],
	);

	const tickFormatter = useCallback((v: string) => v.slice(5), []);
	const tooltipFormatter = useCallback(
		(value: number | undefined) => [`$${(value ?? 0).toFixed(0)}`, "Price"],
		[],
	);
	const labelFormatter = useCallback(
		(label: React.ReactNode) => String(label).slice(5),
		[],
	);

	const tooltipContentStyle = useMemo(
		() => ({
			backgroundColor: theme.palette.background.paper,
			border: `1px solid ${theme.palette.divider}`,
			borderRadius: 8,
			boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
		}),
		[theme.palette.background.paper, theme.palette.divider],
	);

	const activeDotStyle = useMemo(
		() => ({
			r: 5,
			fill: STROKE_COLOR,
			stroke: theme.palette.background.paper,
			strokeWidth: 2,
		}),
		[theme.palette.background.paper],
	);

	const chartStyle = useMemo(
		() => ({ cursor: onPointClick ? "pointer" : "default" }),
		[onPointClick],
	);

	if (loading) {
		return (
			<Box>
				<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
					{RANGE_OPTIONS.map((opt) => (
						<Skeleton
							key={opt.value}
							variant="rounded"
							width={80}
							height={36}
						/>
					))}
				</Stack>
				<Skeleton
					variant="rectangular"
					height={280}
					sx={{ borderRadius: "12px" }}
				/>
			</Box>
		);
	}

	if (data.length === 0) {
		return (
			<Box>
				<ToggleButtonGroup
					value={range}
					exclusive
					onChange={handleRangeChange}
					size="small"
					sx={{ mb: 2 }}
				>
					{RANGE_OPTIONS.map((opt) => (
						<ToggleButton key={opt.value} value={opt.value} sx={toggleSx}>
							{opt.label}
						</ToggleButton>
					))}
				</ToggleButtonGroup>
				<Box
					sx={{
						height: { xs: 200, md: 280 },
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						border: `2px dashed ${theme.palette.divider}`,
						borderRadius: "12px",
					}}
				>
					<Typography variant="body2" color="text.secondary">
						No price data available for this route
					</Typography>
				</Box>
			</Box>
		);
	}

	return (
		<Box>
			{/* Range tabs + summary */}
			<Stack
				direction={{ xs: "column", sm: "row" }}
				justifyContent="space-between"
				alignItems={{ xs: "flex-start", sm: "center" }}
				spacing={1.5}
				sx={{ mb: 2 }}
			>
				<ToggleButtonGroup
					value={range}
					exclusive
					onChange={handleRangeChange}
					size="small"
				>
					{RANGE_OPTIONS.map((opt) => (
						<ToggleButton key={opt.value} value={opt.value} sx={toggleSx}>
							{opt.label}
						</ToggleButton>
					))}
				</ToggleButtonGroup>

				{lowestPrice > 0 && (
					<MuiTooltip
						title={`Prices ${trendDirection === "down" ? "drop" : "rise"} ${trendPercent.toFixed(1)}% over the next ${RANGE_OPTIONS.find((o) => o.value === range)?.label?.toLowerCase()}`}
						arrow
						placement="top"
					>
						<Stack
							direction="row"
							alignItems="baseline"
							spacing={1}
							sx={{ cursor: "help" }}
						>
							<Typography variant="body2" color="text.secondary">
								Lowest:
							</Typography>
							<Typography variant="h3" component="span">
								${lowestPrice.toFixed(0)}
							</Typography>
							{trendDirection !== "neutral" && trendPercent >= 0.1 && (
								<Typography
									variant="body2"
									sx={{
										color:
											trendDirection === "down" ? "success.main" : "error.main",
										fontWeight: 600,
									}}
								>
									{trendDirection === "down" ? "\u2193" : "\u2191"}{" "}
									{trendPercent.toFixed(1)}%
								</Typography>
							)}
						</Stack>
					</MuiTooltip>
				)}
			</Stack>

			{/* Chart */}
			<Box ref={containerRef} sx={{ width: "100%", minWidth: 0, height: { xs: 200, md: 280 } }}>
				{chartSize.width > 0 && chartSize.height > 0 && (
					<AreaChart
						key={chartKey}
						width={chartSize.width}
						height={chartSize.height}
						data={data}
						onClick={handleChartClick}
						style={chartStyle}
						margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
					>
						<defs>
							<linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={STROKE_COLOR} stopOpacity={0.35} />
								<stop
									offset="100%"
									stopColor={STROKE_COLOR}
									stopOpacity={0.02}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="4 4"
							stroke={alpha(theme.palette.divider, 0.5)}
							vertical={false}
						/>
						<XAxis
							dataKey="label"
							tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
							tickFormatter={tickFormatter}
							axisLine={{ stroke: theme.palette.divider }}
							tickLine={false}
							interval="preserveStartEnd"
						/>
						<Tooltip
							formatter={tooltipFormatter}
							contentStyle={tooltipContentStyle}
							labelFormatter={labelFormatter}
						/>
						<Area
							type="monotone"
							dataKey="value"
							stroke={STROKE_COLOR}
							strokeWidth={2.5}
							fill={`url(#${GRADIENT_ID})`}
							dot={false}
							activeDot={activeDotStyle}
							animationDuration={800}
							animationEasing="ease-out"
						/>
					</AreaChart>
				)}
			</Box>
		</Box>
	);
}

const toggleSx = {
	textTransform: "none" as const,
	fontWeight: 600,
	fontSize: "0.8125rem",
	px: 2,
	"&.Mui-selected": {
		backgroundColor: "secondary.main",
		color: "primary.main",
		"&:hover": {
			backgroundColor: "secondary.dark",
		},
	},
};
