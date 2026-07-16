import type {
  SelectGroup,
  SelectOptions} from "@/components/common/UISelect/types";
import {
  isGrouped
} from "@/components/common/UISelect/types";

export function flattenOptions<TOption>(
  options: SelectOptions<TOption>
): TOption[] {
  if (isGrouped(options)) {
    return options.flatMap((group) => group.options);
  }
  return options;
}

export function areValuesEqual<T>(
  a: T,
  b: T,
  by?: keyof T | ((x: T, y: T) => boolean)
): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;

  if (typeof by === "function") {
    return by(a, b);
  }

  if (by && typeof a === "object" && typeof b === "object") {
    return a[by] === b[by];
  }

  return false;
}

// Filter options by search query and searches against getOptionLabel result

export function filterOptions<TOption>(
  options: SelectOptions<TOption>,
  query: string,
  getOptionLabel: (option: TOption) => string
): SelectOptions<TOption> {
  if (!query.trim()) return options;

  const normalizedQuery = query.toLowerCase().trim();

  if (isGrouped(options)) {
    return (options as SelectGroup<TOption>[])
      .map((group) => ({
        ...group,
        options: group.options.filter((option) =>
          getOptionLabel(option).toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((group) => group.options.length > 0);
  }

  return (options as TOption[]).filter((option) =>
    getOptionLabel(option).toLowerCase().includes(normalizedQuery)
  );
}

// Toggle a value in multi - select ( adds if not present and removes if present)
export function toggleMultiValue<TOption, TValue>({
  option,
  currentValues,
  getOptionValue,
  by,
}: {
  option: TOption;
  currentValues: TValue[];
  getOptionValue: (option: TOption) => TValue;
  by?: keyof TValue | ((x: TValue, y: TValue) => boolean);
}): TValue[] {
  const optionValue = getOptionValue(option);

  const exists = currentValues.some(
    (v) => areValuesEqual(v, optionValue, by)
  );

  if (exists) {
    return currentValues.filter((v) => !areValuesEqual(v, optionValue, by));
  }

  return [...currentValues, optionValue];
}

export function toggleSelectAll<TOption, TValue>({
  options,
  currentValues,
  getOptionValue,
  getOptionDisabled,
  by,
}: {
  options: SelectOptions<TOption>;
  currentValues: TValue[];
  getOptionValue: (option: TOption) => TValue;
  getOptionDisabled?: (option: TOption) => boolean;
  by?: keyof TValue | ((x: TValue, y: TValue) => boolean);
}): TValue[] {
  const flat = flattenOptions(options);

  // only non-disabled options
  const enabledOptions = flat.filter((opt) => !getOptionDisabled?.(opt));

  const allSelected =
    enabledOptions.length > 0 &&
    enabledOptions.every((opt) =>
      currentValues.some((v) => areValuesEqual(v, getOptionValue(opt), by))
    );

  if (allSelected) {
    // deselect all enabled options
    const enabledValues = enabledOptions.map((opt) => getOptionValue(opt));
    return currentValues.filter(
      (v) => !enabledValues.some((ev) => areValuesEqual(v, ev, by))
    );
  }

  // select all enabled options
  const toAdd = enabledOptions
    .filter(
      (opt) =>
        !currentValues.some((v) => areValuesEqual(v, getOptionValue(opt), by))
    )
    .map((opt) => getOptionValue(opt));

  return [...currentValues, ...toAdd];
}

export function areAllSelected<TOption, TValue>({
  options,
  currentValues,
  getOptionValue,
  getOptionDisabled,
  by,
}: {
  options: SelectOptions<TOption>;
  currentValues: TValue[];
  getOptionValue: (option: TOption) => TValue;
  getOptionDisabled?: (option: TOption) => boolean;
  by?: keyof TValue | ((x: TValue, y: TValue) => boolean);
}): boolean {
  const flat = flattenOptions(options);
  const enabledOptions = flat.filter((opt) => !getOptionDisabled?.(opt));

  if (enabledOptions.length === 0) return false;

  return enabledOptions.every((opt) =>
    currentValues.some((v) => areValuesEqual(v, getOptionValue(opt), by))
  );
}

// Check if some (but not all) are selected used for intermediate state on select all
export function areSomeSelected<TOption, TValue>({
  options,
  currentValues,
  getOptionValue,
  getOptionDisabled,
  by,
}: {
  options: SelectOptions<TOption>;
  currentValues: TValue[];
  getOptionValue: (option: TOption) => TValue;
  getOptionDisabled?: (option: TOption) => boolean;
  by?: keyof TValue | ((x: TValue, y: TValue) => boolean);
}): boolean {
  const flat = flattenOptions(options);
  const enabledOptions = flat.filter((opt) => !getOptionDisabled?.(opt));

  const selectedCount = enabledOptions.filter((opt) =>
    currentValues.some((v) => areValuesEqual(v, getOptionValue(opt), by))
  ).length;

  return selectedCount > 0 && selectedCount < enabledOptions.length;
}

// Get display label for selected value used in trigger to show what's selected
export function getSelectedLabel<TOption, TValue>({
  value,
  options,
  getOptionValue,
  getOptionLabel,
  by,
}: {
  value: TValue;
  options: SelectOptions<TOption>;
  getOptionValue: (option: TOption) => TValue;
  getOptionLabel: (option: TOption) => string;
  by?: keyof TValue | ((x: TValue, y: TValue) => boolean);
}): string {
  const flat = flattenOptions(options);
  const found = flat.find((opt) =>
    areValuesEqual(getOptionValue(opt), value, by)
  );
  return found ? getOptionLabel(found) : String(value);
}
