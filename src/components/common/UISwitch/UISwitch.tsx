"use client";

import { useId } from "react";
import { Switch } from "@/components/ui/switch";
import type {
  FieldLabel} from "@/components/ui/field";
import {
  Field,
  FieldDescription,
  FieldError
} from "@/components/ui/field";
import { UIFieldLabel } from "@/components/common/UIFieldLabel";

export type UISwitchProps = React.ComponentProps<typeof Switch> & {
  label?: string;
  error?: string;
  description?: string;
  fieldProps?: React.ComponentProps<typeof Field>;
  fieldLabelProps?: React.ComponentProps<typeof FieldLabel>;
  fieldDescriptionProps?: React.ComponentProps<typeof FieldDescription>;
  fieldErrorProps?: React.ComponentProps<typeof FieldError>;
};

export function UISwitch({
  label,
  error,
  description,
  id,
  fieldProps,
  fieldLabelProps,
  fieldDescriptionProps,
  fieldErrorProps,
  ...props
}: UISwitchProps) {
  const defaultId = useId();
  const switchId = id || defaultId;

  return (
    <Field {...fieldProps}>
      <div className="flex items-center gap-3">
        <Switch id={switchId} aria-invalid={!!error} {...props} />
        {label && (
          <UIFieldLabel label={label} required={false} {...fieldLabelProps} />
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
