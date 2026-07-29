import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface UILoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  spinnerClassName?: string;
}

export function UILoader({
  className,
  spinnerClassName,
  ...props
}: UILoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center text-sm text-zinc-500 dark:text-zinc-400 gap-3",
        className,
      )}
      {...props}
    >
      <Spinner
        className={cn(
          "size-6 text-zinc-600 dark:text-zinc-300",
          spinnerClassName,
        )}
      />
    </div>
  );
}
