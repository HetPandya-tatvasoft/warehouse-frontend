import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800",
        className
      )}
    >
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}
