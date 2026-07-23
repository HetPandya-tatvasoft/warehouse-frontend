import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";

type Props<TData> = {
  table: Table<TData>;
};

export function CommonTableHeader<TData>({ table }: Props<TData>) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const isSorted = header.column.getIsSorted();
            const canSort = header.column.getCanSort();
            const sortDirection = isSorted === "asc" ? "ascending" : isSorted === "desc" ? "descending" : undefined;

            return (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                style={{ width: header.getSize() }}
                onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                onKeyDown={(e) => {
                  if (canSort && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    header.column.getToggleSortingHandler()?.(e);
                  }
                }}
                tabIndex={canSort ? 0 : undefined}
                role={canSort ? "button" : undefined}
                className={cn(
                  "select-none whitespace-nowrap outline-none focus-visible:bg-muted/50",
                  canSort && "cursor-pointer hover:bg-muted"
                )}
                aria-sort={sortDirection}
              >
                {!header.isPlaceholder && (
                  <div className="flex items-center gap-1.5">
                    {/* Column label */}
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                    {/* Sort icon */}
                    {canSort && isSorted && (
                      <span className="text-muted-foreground">
                        {isSorted === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                )}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}
