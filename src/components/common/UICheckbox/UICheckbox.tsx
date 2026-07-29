"use client";

import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { UIFieldLabel } from "@/components/common/UIFieldLabel";

export type UICheckboxProps = React.ComponentProps<typeof Checkbox> & {
  label?: React.ReactNode;
  error?: string;
  description?: string;
  required?: boolean;
  fieldProps?: React.ComponentProps<typeof Field>;
  fieldDescriptionProps?: React.ComponentProps<typeof FieldDescription>;
  fieldErrorProps?: React.ComponentProps<typeof FieldError>;
};

export function UICheckbox({
  label,
  error,
  description,
  required = false,
  id,
  fieldProps,
  fieldDescriptionProps,
  fieldErrorProps,
  ...props
}: UICheckboxProps) {
  const defaultId = useId();
  const checkboxId = id || defaultId;

  return (
    <Field {...fieldProps}>
      <div className="flex items-start gap-3">
        <Checkbox id={checkboxId} aria-invalid={!!error} {...props} />
        {label && (
          <UIFieldLabel
            label={typeof label === "string" ? label : undefined}
            required={required}
            fieldLabelProps={{
              htmlFor: checkboxId,
              className: "font-normal cursor-pointer select-none text-sm text-slate-750",
            }}
          >
            {typeof label !== "string" ? label : null}
          </UIFieldLabel>
        )}
      </div>

      {description && (
        <FieldDescription {...fieldDescriptionProps}>
          {description}
        </FieldDescription>
      )}

      {error && <FieldError {...fieldErrorProps}>{error}</FieldError>}
    </Field>
  );
}
