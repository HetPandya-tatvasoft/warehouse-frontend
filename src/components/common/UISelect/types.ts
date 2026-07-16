import type {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { ReactNode } from "react";
import type React from "react";

export type SelectGroup<TOption> = {
  groupLabel: string;
  options: TOption[];
};

// options can be flat TOption[] or grouped SelectGroup<TOption>[]
export type SelectOptions<TOption> = TOption[] | SelectGroup<TOption>[];

export function isGrouped<TValue>(
  options: SelectOptions<TValue>
): options is SelectGroup<TValue>[] {
  return options.length > 0 && "groupLabel" in (options[0] as object);
}

export type SelectFieldAccessors<TOption, TValue> = {
  getOptionLabel?: (option: TOption) => string;
  getOptionValue?: (option: TOption) => TValue;
  getOptionKey?: (option: TOption) => string | number;
  getOptionIcon?: (option: TOption) => ReactNode | undefined;
  getOptionDisabled?: (option: TOption) => boolean;
};

export type SelectFieldProps = {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  fieldProps?: React.ComponentProps<typeof Field>;
  fieldLabelProps?: React.ComponentProps<typeof FieldLabel>;
  fieldDescriptionProps?: React.ComponentProps<typeof FieldDescription>;
  fieldErrorProps?: React.ComponentProps<typeof FieldError>;
};

export type SelectSharedProps<TOption, TValue> = SelectFieldProps &
  SelectFieldAccessors<TOption, TValue> & {
    options: SelectOptions<TOption>;
    placeholder?: string;
    searchable?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
    emptyMessage?: string;
    className?: string;
    by?: keyof TValue | ((a: TValue, b: TValue) => boolean);
  };

export type SingleSelectProps<TOption, TValue> = SelectSharedProps<
  TOption,
  TValue
> & {
  mode: "single";
  value?: TValue;
  onValueChange?: (value: TValue) => void;
};

export type MultiSelectProps<TOption, TValue> = SelectSharedProps<
  TOption,
  TValue
> & {
  mode: "multi";
  value?: TValue[];
  onValueChange?: (value: TValue[]) => void;
  maxCount?: number;
};

export type SelectProps<TOption, TValue = TOption> =
  | SingleSelectProps<TOption, TValue>
  | MultiSelectProps<TOption, TValue>;
