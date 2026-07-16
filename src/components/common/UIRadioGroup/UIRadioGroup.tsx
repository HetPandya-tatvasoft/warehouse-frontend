import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { UIFieldLabel } from "@/components/common/UIFieldLabel";

export type RadioOption = {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
};

export type UIRadioGroupProps = React.ComponentProps<typeof RadioGroup> & {
  label?: string;
  options: RadioOption[];
  error?: string;
  description?: string;
  required?: boolean;
  fieldProps?: React.ComponentProps<typeof Field>;
  fieldLabelProps?: React.ComponentProps<typeof FieldLabel>;
  fieldDescriptionProps?: React.ComponentProps<typeof FieldDescription>;
  fieldErrorProps?: React.ComponentProps<typeof FieldError>;
};

export function UIRadioGroup({
  label,
  options,
  error,
  description,
  required = false,
  fieldProps,
  fieldLabelProps,
  fieldDescriptionProps,
  fieldErrorProps,
  ...props
}: UIRadioGroupProps) {
  const defaultId = useId();

  return (
    <Field className="space-y-2" {...fieldProps}>
      {label && (
        <UIFieldLabel label={label} required={required} {...fieldLabelProps} />
      )}

      <RadioGroup aria-invalid={!!error} {...props}>
        {options.map((option) => {
          const optionId = `${defaultId}-${option.value}`;
          return (
            <div key={option.value} className="flex items-start gap-2">
              <RadioGroupItem
                id={optionId}
                value={option.value}
                disabled={option.disabled}
                className="mt-0.5"
              />
              <div className="flex flex-col gap-0.5">
                <FieldLabel
                  htmlFor={optionId}
                  className="font-normal cursor-pointer"
                >
                  {option.label}
                </FieldLabel>
                {option.description && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </RadioGroup>

      {description && (
        <FieldDescription {...fieldDescriptionProps}>
          {description}
        </FieldDescription>
      )}
      {error && <FieldError {...fieldErrorProps}>{error}</FieldError>}
    </Field>
  );
}
