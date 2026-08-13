"use client";

import * as React from "react";
import { ChevronsUpDown, X, Check, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { UIFieldLabel } from "@/components/common/UIFieldLabel";
import { cn } from "@/lib/utils";
import { type SelectProps, type SelectOptions, isGrouped } from "./types";
import {
  toggleMultiValue,
  toggleSelectAll,
  areAllSelected,
  areSomeSelected,
  getSelectedLabel,
  areValuesEqual,
  filterOptions,
} from "./utils";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Main component
export function UISelect<TOption, TValue = TOption>(
  props: SelectProps<TOption, TValue>,
) {
  const {
    options,
    placeholder = "Select...",
    searchable = false,
    disabled = false,
    isLoading = false,
    emptyMessage = "No results found.",
    className,
    label,
    description,
    error,
    required,
    fieldProps,
    fieldLabelProps,
    fieldDescriptionProps,
    fieldErrorProps,
    getOptionIcon,
    getOptionBadge,
    by,
    mode,
    onSearchChange,
  } = props;

  const listboxId = React.useId();

  const getOptionLabel = React.useMemo(() => {
    return (
      props.getOptionLabel ??
      ((option: TOption) => {
        if (
          typeof option === "object" &&
          option !== null &&
          "label" in option
        ) {
          return String(option.label);
        }
        return String(option);
      })
    );
  }, [props.getOptionLabel]);

  const getOptionValue = React.useMemo(() => {
    return (
      props.getOptionValue ??
      ((option: TOption) => {
        if (
          typeof option === "object" &&
          option !== null &&
          "value" in option
        ) {
          return option.value as unknown as TValue;
        }
        return option as unknown as TValue;
      })
    );
  }, [props.getOptionValue]);

  const getOptionKey = React.useMemo(() => {
    return (
      props.getOptionKey ??
      ((option: TOption) => {
        if (typeof option === "object" && option !== null) {
          if ("value" in option) return String(option.value);
          if ("id" in option) return String(option.id);
        }
        return String(option);
      })
    );
  }, [props.getOptionKey]);

  const getOptionDisabled = React.useMemo(() => {
    return (
      props.getOptionDisabled ??
      ((option: TOption) => {
        if (
          typeof option === "object" &&
          option !== null &&
          "disabled" in option
        ) {
          return !!option.disabled;
        }
        return false;
      })
    );
  }, [props.getOptionDisabled]);

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSearchChange = React.useCallback(
    (val: string) => {
      setSearch(val);
      onSearchChange?.(val);
    },
    [onSearchChange],
  );

  const isMulti = mode === "multi";

  const currentValue = React.useMemo(() => {
    if (mode === "single") return props.value;
    return props.value ?? [];
  }, [mode, props.value]);

  const filteredOptions = React.useMemo(() => {
    return filterOptions(options, search, getOptionLabel);
  }, [options, search, getOptionLabel]);

  const handleSelect = React.useCallback(
    (option: TOption) => {
      if (mode === "single") {
        props.onValueChange?.(getOptionValue(option));
        setOpen(false);
        setSearch("");
      } else {
        const newValues = toggleMultiValue({
          option,
          currentValues: (props.value ?? []) as TValue[],
          getOptionValue,
          by,
        });
        props.onValueChange?.(newValues);
      }
    },
    [props, getOptionValue, by, mode],
  );

  const handleSelectAll = React.useCallback(() => {
    if (mode !== "multi") return;
    const newValues = toggleSelectAll({
      options: filteredOptions,
      currentValues: (props.value ?? []) as TValue[],
      getOptionValue,
      getOptionDisabled,
      by,
    });
    props.onValueChange?.(newValues);
  }, [mode, filteredOptions, getOptionValue, getOptionDisabled, by, props]);

  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (mode === "single") {
        props.onValueChange?.(undefined as TValue);
      } else {
        props.onValueChange?.([]);
      }
    },
    [props, mode],
  );

  const handleRemoveChip = React.useCallback(
    (val: TValue, e: React.MouseEvent) => {
      e.stopPropagation();
      if (mode !== "multi") return;
      const newValues = ((props.value ?? []) as TValue[]).filter(
        (v) => !areValuesEqual(v, val, by),
      );
      props.onValueChange?.(newValues);
    },
    [props, by, mode],
  );

  // ── Checks ──────────────────────────────
  const isSelected = React.useCallback(
    (option: TOption): boolean => {
      const optionValue = getOptionValue(option);
      if (mode === "single") {
        if (props.value === undefined) return false;
        return areValuesEqual(optionValue, props.value, by);
      }
      return ((props.value ?? []) as TValue[]).some((v) =>
        areValuesEqual(v, optionValue, by),
      );
    },
    [mode, props.value, getOptionValue, by],
  );

  const allSelected = React.useMemo(() => {
    if (!isMulti) return false;
    return areAllSelected({
      options: filteredOptions,
      currentValues: (mode === "multi" ? (props.value ?? []) : []) as TValue[],
      getOptionValue,
      getOptionDisabled,
      by,
    });
  }, [
    isMulti,
    filteredOptions,
    mode,
    props.value,
    getOptionValue,
    getOptionDisabled,
    by,
  ]);

  const someSelected = React.useMemo(() => {
    if (!isMulti) return false;
    return areSomeSelected({
      options: filteredOptions,
      currentValues: (mode === "multi" ? (props.value ?? []) : []) as TValue[],
      getOptionValue,
      getOptionDisabled,
      by,
    });
  }, [
    isMulti,
    filteredOptions,
    mode,
    props.value,
    getOptionValue,
    getOptionDisabled,
    by,
  ]);

  const hasValue = isMulti
    ? ((currentValue as TValue[])?.length ?? 0) > 0
    : currentValue !== undefined &&
      currentValue !== null &&
      currentValue !== "";

  const TriggerUI = (
    <div
      role="combobox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-haspopup="listbox"
      aria-invalid={!!error}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          setOpen(true);
        }
      }}
      onClick={() => !disabled && setOpen((prev) => !prev)}
      className={cn(
        "relative flex min-h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm transition-colors outline-none",
        "hover:border-ring/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20",
        open && "border-ring ring-2 ring-ring/20",
        error && "border-destructive ring-2 ring-destructive/20",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {/* Left — selected value display */}
      <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">
        {/* Single mode */}
        {!isMulti && (
          <>
            {hasValue ? (
              <span className="truncate">
                {isLoading ? (
                  <span className="text-muted-foreground animate-pulse">Loading...</span>
                ) : (
                  getSelectedLabel({
                    value: currentValue as TValue,
                    options,
                    getOptionValue,
                    getOptionLabel,
                    by,
                  })
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </>
        )}

        {/* Multi mode — chips */}
        {isMulti && (
          <>
            {!hasValue && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {hasValue && (
              <MultiChips
                values={currentValue as TValue[]}
                options={options}
                maxCount={mode === "multi" ? (props.maxCount ?? 3) : 3}
                getOptionLabel={getOptionLabel}
                getOptionValue={getOptionValue}
                getOptionKey={getOptionKey}
                onRemove={handleRemoveChip}
                disabled={disabled}
                by={by}
              />
            )}
          </>
        )}
      </div>

      {/* Right — clear + chevron */}
      <div className="flex shrink-0 items-center gap-1">
        {hasValue && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={handleClear}
            className="rounded text-muted-foreground transition hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
        <ChevronsUpDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </div>
    </div>
  );

  const ContentUI = (
    <Command shouldFilter={false}>
      {/* Search */}
      {searchable ? (
        <CommandInput
          placeholder="Search..."
          value={search}
          onValueChange={handleSearchChange}
        />
      ) : (
        <CommandPrimitive.Input
          value={search}
          onValueChange={handleSearchChange}
          className="sr-only"
        />
      )}

      <CommandList id={listboxId}>
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && <CommandEmpty>{emptyMessage}</CommandEmpty>}

        {!isLoading && (
          <>
            {/* Select All — multi only */}
            {isMulti && (
              <>
                <CommandGroup>
                  <CommandItem onSelect={handleSelectAll} className="gap-2">
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : someSelected
                            ? "indeterminate"
                            : false
                      }
                      className="pointer-events-none"
                    />
                    <span className="font-medium">Select All</span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

             <OptionsList
              options={filteredOptions}
              isMulti={isMulti}
              isSelected={isSelected}
              getOptionLabel={getOptionLabel}
              getOptionKey={getOptionKey}
              getOptionIcon={getOptionIcon}
              getOptionBadge={getOptionBadge}
              getOptionDisabled={getOptionDisabled}
              onSelect={handleSelect}
            />
          </>
        )}
      </CommandList>
    </Command>
  );

  // ── Render — Popover (desktop) or Drawer (mobile) ──
  return (
    <Field className="space-y-1" {...fieldProps}>
      {label && (
        <UIFieldLabel
          label={label}
          required={required}
          fieldLabelProps={fieldLabelProps}
        />
      )}

      {isDesktop ? (
        <Popover open={open} onOpenChange={(val) => !disabled && setOpen(val)}>
          <PopoverTrigger asChild>{TriggerUI}</PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) p-0"
            align="start"
            sideOffset={4}
          >
            {open && ContentUI}
          </PopoverContent>
        </Popover>
      ) : (
        <Drawer open={open} onOpenChange={(val) => !disabled && setOpen(val)}>
          <DrawerTrigger asChild>{TriggerUI}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{label ?? placeholder}</DrawerTitle>
            </DrawerHeader>
            <div className="p-2">{open && ContentUI}</div>
          </DrawerContent>
        </Drawer>
      )}

      {description && (
        <FieldDescription {...fieldDescriptionProps}>
          {description}
        </FieldDescription>
      )}
      {error && <FieldError {...fieldErrorProps}>{error}</FieldError>}
    </Field>
  );
}

// MultiChips — selected badges in trigger
function MultiChips<TOption, TValue>({
  values,
  options,
  maxCount,
  getOptionLabel,
  getOptionValue,
  onRemove,
  disabled,
  by,
}: {
  values: TValue[];
  options: SelectOptions<TOption>;
  maxCount: number;
  getOptionLabel: (option: TOption) => string;
  getOptionValue: (option: TOption) => TValue;
  getOptionKey: (option: TOption) => string | number;
  onRemove: (val: TValue, e: React.MouseEvent) => void;
  disabled?: boolean;
  by?: keyof TValue | ((x: TValue, y: TValue) => boolean);
}) {
  const visible = values.slice(0, maxCount);
  const overflow = values.length - maxCount;

  return (
    <>
      {visible.map((val, i) => {
        const label = getSelectedLabel({
          value: val,
          options,
          getOptionValue,
          getOptionLabel,
          by,
        });

        return (
          <Badge
            key={i}
            variant="secondary"
            className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-normal"
          >
            <span className="max-w-25 truncate">{label}</span>
            {!disabled && (
              <button
                type="button"
                aria-label={`Remove ${label}`}
                onClick={(e) => onRemove(val, e)}
                className="ml-0.5 rounded hover:text-destructive transition"
              >
                <X className="size-3" />
              </button>
            )}
          </Badge>
        );
      })}

      {overflow > 0 && (
        <Badge variant="outline" className="px-1.5 py-0.5 text-xs font-normal">
          +{overflow} more
        </Badge>
      )}
    </>
  );
}

// OptionsList — flat or grouped options
function OptionsList<TOption>({
  options,
  isMulti,
  isSelected,
  getOptionLabel,
  getOptionKey,
  getOptionIcon,
  getOptionBadge,
  getOptionDisabled,
  onSelect,
}: {
  options: SelectOptions<TOption>;
  isMulti: boolean;
  isSelected: (option: TOption) => boolean;
  getOptionLabel: (option: TOption) => string;
  getOptionKey: (option: TOption) => string | number;
  getOptionIcon?: (option: TOption) => React.ReactNode | undefined;
  getOptionBadge?: (option: TOption) => React.ReactNode | undefined;
  getOptionDisabled?: (option: TOption) => boolean;
  onSelect: (option: TOption) => void;
}) {
  if (isGrouped(options)) {
    return (
      <>
        {options.map((group, i) => (
          <React.Fragment key={group.groupLabel}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={group.groupLabel}>
              {group.options.map((option) => (
                <OptionItem
                  key={getOptionKey(option)}
                  option={option}
                  isMulti={isMulti}
                  selected={isSelected(option)}
                  disabled={getOptionDisabled?.(option) ?? false}
                  getOptionLabel={getOptionLabel}
                  getOptionIcon={getOptionIcon}
                  getOptionBadge={getOptionBadge}
                  onSelect={onSelect}
                />
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </>
    );
  }

  return (
    <CommandGroup>
      {(options as TOption[]).map((option) => (
        <OptionItem
          key={getOptionKey(option)}
          option={option}
          isMulti={isMulti}
          selected={isSelected(option)}
          disabled={getOptionDisabled?.(option) ?? false}
          getOptionLabel={getOptionLabel}
          getOptionIcon={getOptionIcon}
          getOptionBadge={getOptionBadge}
          onSelect={onSelect}
        />
      ))}
    </CommandGroup>
  );
}

// OptionItem — single option row
function OptionItem<TOption>({
  option,
  isMulti,
  selected,
  disabled,
  getOptionLabel,
  getOptionIcon,
  getOptionBadge,
  onSelect,
}: {
  option: TOption;
  isMulti: boolean;
  selected: boolean;
  disabled: boolean;
  getOptionLabel: (option: TOption) => string;
  getOptionIcon?: (option: TOption) => React.ReactNode | undefined;
  getOptionBadge?: (option: TOption) => React.ReactNode | undefined;
  onSelect: (option: TOption) => void;
}) {
  const icon = getOptionIcon?.(option);
  const label = getOptionLabel(option);
  const badge = getOptionBadge?.(option);

  return (
    <CommandItem
      value={label}
      disabled={disabled}
      onSelect={() => !disabled && onSelect(option)}
      className={cn(
        "flex items-center gap-2",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {/* Checkbox — multi mode only */}
      {isMulti && (
        <Checkbox checked={selected} className="pointer-events-none" />
      )}

      {/* Icon */}
      {icon && <span className="shrink-0 [&_svg]:size-4">{icon}</span>}

      {/* Label */}
      <span className="flex-1 truncate">{label}</span>

      {/* Badge */}
      {badge && <div className="shrink-0">{badge}</div>}

      {/* Check — single mode only */}
      {!isMulti && (
        <Check
          className={cn(
            "ml-2 size-4 shrink-0",
            selected ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </CommandItem>
  );
}
