"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { UIFieldLabel } from "@/components/common/UIFieldLabel";
import { cn } from "@/lib/utils";
import type { UIDatePickerProps } from "./types";
import {
  buildDisabledMatcher,
  mergeDateAndTime,
  extractTime,
  range,
  pad2,
} from "./utils";

export function UIDatePicker({
  // value
  value,
  onValueChange,

  // time
  withTime = false,
  timeStep = 1,

  // display
  placeholder = "Pick a date",
  dateFormat = "PPP",
  dateTimeFormat = "PPP p",

  // constraints
  disabled = false,
  disabledDates,
  minDate,
  maxDate,

  // calendar config
  defaultMonth,
  numberOfMonths = 1,

  // customization
  clearable = true,
  className,

  // field wrapper
  label,
  description,
  error,
  required,
  fieldProps,
  fieldLabelProps,
  fieldDescriptionProps,
  fieldErrorProps,
}: UIDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // ── Disabled matcher ────────────────────

  const disabledMatcher = React.useMemo(
    () => buildDisabledMatcher({ minDate, maxDate, disabledDates }),
    [minDate, maxDate, disabledDates]
  );

  // ── Time state — only used when withTime ──

  const time = React.useMemo(() => extractTime(value), [value]);

  // ── Handlers ────────────────────────────

  const handleDateSelect = React.useCallback(
    (date: Date | undefined) => {
      if (!date) {
        onValueChange?.(undefined);
        return;
      }

      if (withTime) {
        // preserve existing time when picking a new date
        const merged = mergeDateAndTime(date, time);
        onValueChange?.(merged);
        // don't close — let user set time too
      } else {
        onValueChange?.(date);
        setOpen(false);
      }
    },
    [withTime, time, onValueChange]
  );

  const handleTimeChange = React.useCallback(
    (part: "hours" | "minutes" | "seconds", val: string) => {
      const baseDate = value ?? new Date();
      const newTime = { ...time, [part]: Number(val) };
      const merged = mergeDateAndTime(baseDate, newTime);
      onValueChange?.(merged);
    },
    [value, time, onValueChange]
  );

  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange?.(undefined);
    },
    [onValueChange]
  );

  // ── Display text ────────────────────────

  const displayText = value
    ? format(value, withTime ? dateTimeFormat : dateFormat)
    : placeholder;

  // ── Render ──────────────────────────────

  return (
    <Field className="space-y-1" {...fieldProps}>
      {label && (
        <UIFieldLabel
          label={label}
          required={required}
          fieldLabelProps={fieldLabelProps}
        />
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm transition-colors",
              "hover:border-ring/50",
              open && "border-ring ring-2 ring-ring/20",
              error && "border-destructive ring-2 ring-destructive/20",
              !value && "text-muted-foreground",
              disabled && "cursor-not-allowed opacity-50",
              className
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <CalendarIcon className="size-4 shrink-0" />
              <span className="truncate">{displayText}</span>
            </span>

            {clearable && value && !disabled && (
              <button
                type="button"
                aria-label="Clear date"
                onClick={handleClear}
                className="shrink-0 rounded text-muted-foreground transition hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            defaultMonth={defaultMonth ?? value}
            numberOfMonths={numberOfMonths}
            disabled={disabledMatcher}
            autoFocus
          />

          {/* Time picker — only when withTime */}
          {withTime && (
            <div className="flex items-center gap-2 border-t p-3">
              <TimeSelect
                label="HH"
                value={time.hours}
                options={range(24)}
                onChange={(v) => handleTimeChange("hours", v)}
                disabled={!value}
              />
              <span className="text-muted-foreground">:</span>
              <TimeSelect
                label="MM"
                value={time.minutes}
                options={range(60, timeStep)}
                onChange={(v) => handleTimeChange("minutes", v)}
                disabled={!value}
              />
              <span className="text-muted-foreground">:</span>
              <TimeSelect
                label="SS"
                value={time.seconds}
                options={range(60)}
                onChange={(v) => handleTimeChange("seconds", v)}
                disabled={!value}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>

      {description && (
        <FieldDescription {...fieldDescriptionProps}>
          {description}
        </FieldDescription>
      )}
      {error && <FieldError {...fieldErrorProps}>{error}</FieldError>}
    </Field>
  );
}

// ─────────────────────────────────────────
// TimeSelect — hour/minute/second dropdown
// ─────────────────────────────────────────

function TimeSelect({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  options: number[];
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={String(value)} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8 w-[70px] text-xs" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        {options.map((opt) => (
          <SelectItem key={opt} value={String(opt)}>
            {pad2(opt)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
