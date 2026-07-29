"use client";

import type { ReactNode } from "react";
import type { UIModalProps } from "../UIModal/UIModal";
import { UIModal } from "../UIModal/UIModal";
import { UIButton } from "../UIButton";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";

  onConfirm: () => void;
  onCancel?: () => void;

  isLoading?: boolean;

  icon?: ReactNode;
  size?: UIModalProps["size"];
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Ok",
  cancelText = "Cancel",
  confirmVariant,
  onConfirm,
  onCancel,
  isLoading,
  icon,
  size,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <UIModal
      open={open}
      onOpenChange={onOpenChange}
      size={size}
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
      showCloseButton={!isLoading}
      title={title}
      description={description}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <UIButton
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </UIButton>
          <UIButton
            type="button"
            variant={confirmVariant}
            onClick={handleConfirm}
            loading={isLoading}
          >
            {confirmText}
          </UIButton>
        </div>
      }
    >
      {icon && <div className="flex justify-center pb-2">{icon}</div>}
    </UIModal>
  );
}
