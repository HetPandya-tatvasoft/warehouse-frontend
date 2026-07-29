"use client";

import * as React from "react";
import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import type {
  FieldLabel} from "@/components/ui/field";
import {
  Field,
  FieldDescription,
  FieldError
} from "@/components/ui/field";
import { UIFieldLabel } from "@/components/common/UIFieldLabel";
import { UIButton } from "@/components/common/UIButton";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UIInputProps extends React.ComponentProps<typeof Input> {
  error?: string;
  label?: string;
  required?: boolean;
  description?: string;
  fieldProps?: React.ComponentProps<typeof Field>;
  fieldLabelProps?: React.ComponentProps<typeof FieldLabel>;
  fieldDescriptionProps?: React.ComponentProps<typeof FieldDescription>;
  fieldErrorProps?: React.ComponentProps<typeof FieldError>;
}

function UIInputComponent({
  required = false,
  error,
  label,
  id,
  description,
  fieldProps,
  fieldLabelProps,
  fieldDescriptionProps,
  fieldErrorProps,
  ...props
}: UIInputProps) {
  const defaultId = useId();
  const inputId = id || defaultId;
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = props.type === "password";
  const resolvedType = isPasswordType
    ? showPassword
      ? "text"
      : "password"
    : props.type;

  return (
    <Field className="space-y-1" {...fieldProps}>
      {label && (
        <UIFieldLabel
          label={label}
          required={required}
          htmlFor={inputId}
          {...fieldLabelProps}
        />
      )}

      <div className="relative w-full">
        <Input
          id={inputId}
          aria-invalid={!!error}
          {...props}
          type={resolvedType}
          className={cn(isPasswordType && "pr-9", props.className)}
        />
        {isPasswordType && (
          <UIButton
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-1 top-1 text-muted-foreground hover:text-foreground z-10 h-6 w-6"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </UIButton>
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

export const UIInput = React.memo(UIInputComponent);
