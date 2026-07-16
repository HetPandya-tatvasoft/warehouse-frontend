import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface UIButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function UIButton({
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  className,
  size = "default",
  ...props
}: UIButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(fullWidth && "w-full", className)}
      size={size}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        leftIcon && <span className="h-4 w-4">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="h-4 w-4">{rightIcon}</span>}
    </Button>
  );
}
