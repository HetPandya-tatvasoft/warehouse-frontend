import { FieldLabel } from "@/components/ui/field";

export type UIFieldLabelProps = {
  label?: string;
  required?: boolean;
  fieldLabelProps?: React.ComponentProps<typeof FieldLabel>;
  children?: React.ReactNode;
  htmlFor?: string;
};

export function UIFieldLabel({
  label,
  required,
  fieldLabelProps,
  children,
  htmlFor
}: UIFieldLabelProps) {
  return (
    <FieldLabel htmlFor={htmlFor} {...fieldLabelProps}>
      {label || children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </FieldLabel>
  );
}
