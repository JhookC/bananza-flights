import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { parse, format } from "date-fns";
import type { SxProps, Theme } from "@mui/material/styles";

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: Date;
  required?: boolean;
  error?: string;
  sx?: SxProps<Theme>;
}

export default function DatePickerField({
  label,
  value,
  onChange,
  minDate,
  required,
  error,
  sx,
}: DatePickerFieldProps) {
  const dateValue = value ? parse(value, "yyyy-MM-dd", new Date()) : null;

  return (
    <DatePicker
      label={label}
      value={dateValue}
      minDate={minDate}
      format="MM/dd/yy"
      onChange={(newValue) => {
        onChange(newValue ? format(newValue, "yyyy-MM-dd") : "");
      }}
      slotProps={{
        textField: {
          required,
          fullWidth: true,
          error: Boolean(error),
          helperText: error,
          sx,
        },
      }}
    />
  );
}
