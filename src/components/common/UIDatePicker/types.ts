import type { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import type { Matcher } from "react-day-picker";

export type UIDatePickerFieldProps = {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  fieldProps?: React.ComponentProps<typeof Field>;
  fieldLabelProps?: React.ComponentProps<typeof FieldLabel>;
  fieldDescriptionProps?: React.ComponentProps<typeof FieldDescription>;
  fieldErrorProps?: React.ComponentProps<typeof FieldError>;
};

export type UIDatePickerProps = UIDatePickerFieldProps & {
    value?: Date
    onValueChange?: (date: Date | undefined) => void
    withTime?: boolean
    timeStep?: number

    placeholder?: string;
    dateFormat?: string
    dateTimeFormat?: string

    disabled?: boolean
    disabledDates?: Matcher | Matcher[]
    minDate?: Date
    maxDate?: Date

    defaultMonth?: Date
    numberOfMonths?: number

    clearable?: boolean
    className?: string
}