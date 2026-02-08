import { useState, useMemo } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

interface AsyncAutocompleteProps<T> {
  value: T | null;
  options: T[];
  defaultOptions?: T[];
  loading: boolean;
  onInputChange: (value: string) => void;
  onChange: (value: T | null) => void;
  getOptionLabel: (option: T) => string;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement> & { key: string },
    option: T,
  ) => React.ReactNode;
  renderSelectedDisplay?: (value: T) => React.ReactNode;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  excludeValue?: T | null;
  label: string;
  placeholder?: string;
  error?: string;
  sx?: SxProps<Theme>;
}

function SkeletonOptions() {
  return (
    <Box sx={{ p: 1 }}>
      {[0, 1, 2].map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={40}
          sx={{ mb: 0.5, borderRadius: 1 }}
        />
      ))}
    </Box>
  );
}

export default function AsyncAutocomplete<T>({
  value,
  options,
  defaultOptions = [],
  loading,
  onInputChange,
  onChange,
  getOptionLabel,
  renderOption,
  renderSelectedDisplay,
  isOptionEqualToValue,
  excludeValue,
  label,
  placeholder,
  error,
  sx,
}: AsyncAutocompleteProps<T>) {
  const [open, setOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const showCard = Boolean(renderSelectedDisplay && value && !open);

  const isSearching = typedText.length >= 2;

  const displayedOptions = useMemo(() => {
    const base = isSearching ? options : defaultOptions;

    if (!excludeValue || !isOptionEqualToValue) return base;
    return base.filter((opt) => !isOptionEqualToValue(opt, excludeValue));
  }, [isSearching, options, defaultOptions, excludeValue, isOptionEqualToValue]);

  const cardSx = renderSelectedDisplay
    ? {
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          minHeight: 88,
          cursor: "pointer",
        },
        ...(showCard
          ? {
              "& .MuiOutlinedInput-input": { opacity: 0 },
              "& .MuiInputLabel-root": { opacity: 0 },
              "& .MuiAutocomplete-endAdornment": { display: "none" },
            }
          : {}),
      }
    : {};

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={value}
      options={displayedOptions}
      loading={isSearching && loading}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      renderOption={renderOption}
      onInputChange={(_event, newValue, reason) => {
        if (reason === "input") {
          setTypedText(newValue);
          onInputChange(newValue);
        } else if (reason === "clear") {
          setTypedText("");
          onInputChange("");
        }
      }}
      onChange={(_event, newValue) => {
        onChange(newValue);
        setTypedText("");
        onInputChange("");
      }}
      filterOptions={(x) => x}
      noOptionsText={
        isSearching ? "No results" : "Type to search for more airports"
      }
      loadingText={<SkeletonOptions />}
      sx={{ ...cardSx, ...sx }}
      slotProps={{
        paper: { elevation: 4, sx: { mt: 0.5, borderRadius: 2 } },
      }}
      renderInput={(params) => (
        <Box sx={{ position: "relative" }}>
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={Boolean(error)}
            helperText={error}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isSearching && loading && (
                      <CircularProgress color="inherit" size={20} />
                    )}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
          {showCard && (
            <Box
              sx={{
                position: "absolute",
                inset: "1px",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                px: 2,
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              {renderSelectedDisplay!(value!)}
            </Box>
          )}
        </Box>
      )}
    />
  );
}
