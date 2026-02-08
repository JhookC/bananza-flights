import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";

interface Option<T> {
	value: T;
	label: string;
}

interface CheckboxFilterGroupProps<T extends string | number> {
	label: string;
	options: Option<T>[];
	selected: T[];
	onChange: (selected: T[]) => void;
}

export default function CheckboxFilterGroup<T extends string | number>({
	label,
	options,
	selected,
	onChange,
}: CheckboxFilterGroupProps<T>) {
	const handleToggle = (value: T) => {
		const next = selected.includes(value)
			? selected.filter((s) => s !== value)
			: [...selected, value];
		onChange(next);
	};

	return (
		<div>
			<Typography variant="h3" sx={{ mb: 1 }}>
				{label}
			</Typography>
			<FormGroup>
				{options.map((option) => (
					<FormControlLabel
						key={String(option.value)}
						control={
							<Checkbox
								checked={selected.includes(option.value)}
								onChange={() => handleToggle(option.value)}
								sx={{
									"&.Mui-checked": {
										color: "secondary.main",
									},
								}}
							/>
						}
						label={<Typography variant="body2">{option.label}</Typography>}
					/>
				))}
			</FormGroup>
		</div>
	);
}
