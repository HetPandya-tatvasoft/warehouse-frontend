"use client";

import { useEffect, useState } from "react";

export function useUnsavedChangesGuard(isDirty: boolean) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const confirmAction = (action: () => void) => {
    if (!isDirty) {
      action();
      return;
    }

    setPendingAction(() => action);
    setIsOpen(true);
  };

  const confirm = () => {
    pendingAction?.();
    setPendingAction(null);
    setIsOpen(false);
  };

  const cancel = () => {
    setPendingAction(null);
    setIsOpen(false);
  };

  return {
    isOpen,
    confirmAction,
    confirm,
    cancel,
  };
}
