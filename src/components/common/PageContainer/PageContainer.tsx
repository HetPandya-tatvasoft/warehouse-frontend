import React from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function PageContainer({
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn("space-y-6 w-full", className)} {...props}>
      {children}
    </div>
  );
}
