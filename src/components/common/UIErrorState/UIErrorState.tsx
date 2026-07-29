"use client";

import { AlertTriangle } from "lucide-react";
import { UIButton } from "../UIButton/UIButton";

export interface UIErrorStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function UIErrorState({
  title = "Something went wrong",
  description = "We couldn't load the requested data. Please try again.",
  actionText,
  onAction,
  className,
}: UIErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[300px] border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50/50 dark:bg-red-950/20 p-6 text-center ${
        className || ""
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-rose-600 dark:text-rose-400 mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h2 className="text-sm font-semibold text-rose-600 dark:text-rose-400">
        {title}
      </h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
        {description}
      </p>
      {actionText && onAction && (
        <UIButton className="mt-4" variant="outline" onClick={onAction}>
          {actionText}
        </UIButton>
      )}
    </div>
  );
}
