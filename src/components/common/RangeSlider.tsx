import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

interface RangeSliderProps {
	label: string;
	value: [number, number];
	onChange: (value: [number, number]) => void;
	min: number;
	max: number;
	step?: number;
	formatLabel?: (value: number) => string;
}

export default function RangeSlider({
	label,
	value,
	onChange,
	min,
	max,
	step = 1,
	formatLabel = String,
}: RangeSliderProps) {
	return (
		<Box>
			<Typography variant="h3" sx={{ mb: 0.5 }}>
				{label}
			</Typography>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ mb: 1.5, display: "block" }}
			>
				{formatLabel(value[0])} — {formatLabel(value[1])}
			</Typography>
			<Slider
				value={value}
				onChange={(_event, newValue) => onChange(newValue as [number, number])}
				min={min}
				max={max}
				step={step}
				valueLabelDisplay="auto"
				valueLabelFormat={formatLabel}
				sx={{
					mx: "auto",
					width: "calc(100% - 40px)",
					display: "flex",
					"& .MuiSlider-valueLabel": {
						zIndex: 1500,
					},
				}}
				slotProps={{
					valueLabel: {
						style: { position: "fixed" as const },
					},
				}}
			/>
		</Box>
	);
}
