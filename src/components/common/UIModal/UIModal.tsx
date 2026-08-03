"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import React from "react";

export type UIModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;

  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;

  ariaLabel?: string;

  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
};

const SIZE_CLASSES: Record<NonNullable<UIModalProps["size"]>, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-[95vw] sm:h-[90vh]",
};

export function UIModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  ariaLabel,
  size = "md",
  className,
}: UIModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        onInteractOutside={(e) => {
          if (!closeOnBackdropClick) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!closeOnEscape) e.preventDefault();
        }}
        aria-label={!title ? ariaLabel : undefined}
        className={cn(
          SIZE_CLASSES[size],
          "max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden",
          className
        )}
      >
        {(title || description) && (
          <DialogHeader className="pt-6 px-6 pb-0">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        <div
          className={cn(
            "flex-1 overflow-y-auto px-6 py-4",
            !(title || description) && "pt-6"
          )}
        >
          {children}
        </div>
        {footer && (
          <DialogFooter className="m-0 rounded-t-none px-6 py-4">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
