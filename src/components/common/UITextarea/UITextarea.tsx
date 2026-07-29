"use client";

import * as React from "react";
import { useId } from "react";
import { Textarea } from "@/components/ui/textarea";
import type { FieldLabel } from "@/components/ui/field";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { UIFieldLabel } from "@/components/common/UIFieldLabel";

export type UITextareaProps = React.ComponentProps<typeof Textarea> & {
  label?: string;
  error?: string;
  required?: boolean;
  description?: string;
  fieldProps?: React.ComponentProps<typeof Field>;
  fieldLabelProps?: React.ComponentProps<typeof FieldLabel>;
  fieldDescriptionProps?: React.ComponentProps<typeof FieldDescription>;
  fieldErrorProps?: React.ComponentProps<typeof FieldError>;
};

function UITextareaComponent({
  label,
  error,
  required = false,
  id,
  description,
  fieldProps,
  fieldLabelProps,
  fieldDescriptionProps,
  fieldErrorProps,
  ...props
}: UITextareaProps) {
  const defaultId = useId();
  const inputId = id || defaultId;

  return (
    <Field className="space-y-1" {...fieldProps}>
      {label && (
        <UIFieldLabel label={label} required={required} {...fieldLabelProps} />
      )}

      <Textarea id={inputId} aria-invalid={!!error} {...props} />

      {description && (
        <FieldDescription {...fieldDescriptionProps}>
          {description}
        </FieldDescription>
      )}

      {error && <FieldError {...fieldErrorProps}>{error}</FieldError>}
    </Field>
  );
}

export const UITextarea = React.memo(UITextareaComponent);
