import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import RemoveRounded from "@mui/icons-material/RemoveRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";

interface PassengerCounterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function PassengerCounter({
  label,
  value,
  onChange,
  min = 1,
  max = 9,
}: PassengerCounterProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 1.5,
        py: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 48,
        borderRadius: "10px",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <PersonRounded fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary" noWrap>
          {label}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton
          size="small"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <RemoveRounded fontSize="small" />
        </IconButton>
        <Typography variant="body1" sx={{ minWidth: 20, textAlign: "center" }}>
          {value}
        </Typography>
        <IconButton
          size="small"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          <AddRounded fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}
