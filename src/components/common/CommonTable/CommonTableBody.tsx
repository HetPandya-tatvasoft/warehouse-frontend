import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

type Props<TData> = {
  table: Table<TData>;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  skeletonRowsCount?: number;
};

export function CommonTableBody<TData>({
  table,
  isLoading = false,
  emptyState,
  skeletonRowsCount = 5,
}: Props<TData>) {
  const rows = table.getRowModel().rows;
  const visibleColumnsCount = table.getVisibleLeafColumns().length;

  if (isLoading) {
    return (
      <TableBody>
        {Array.from({ length: skeletonRowsCount }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: visibleColumnsCount }).map((_, j) => (
              <TableCell key={j}>
                <div className="h-4 w-full rounded bg-muted animate-pulse" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    );
  }

  if (rows.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={visibleColumnsCount}
            className="h-32 text-center text-muted-foreground"
          >
            {emptyState ?? "No results found."}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
