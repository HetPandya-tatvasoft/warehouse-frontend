import type { Table } from "@tanstack/react-table";
import { UIButton } from "@/components/common/UIButton";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props<TData> = {
  table: Table<TData>;
  pageSizeOptions?: number[];
  entityName?: string;
};

export function CommonTablePagination<TData>({
  table,
  pageSizeOptions = [5, 10, 20, 30, 40, 50],
  entityName = "rows",
}: Props<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;

  const totalItems = table.getRowCount();
  const currentRowsCount = table.getRowModel().rows.length;
  const startIndex = currentRowsCount === 0 || pageIndex * pageSize >= totalItems
    ? 0 : pageIndex * pageSize + 1;
  const endIndex = startIndex === 0 ? 0 : Math.min(startIndex + currentRowsCount - 1, totalItems);

  const startPage = Math.max(0, Math.min(pageCount - 5, pageIndex - 2));
  const endPage = Math.min(pageCount, startPage + 5);
  const visiblePages = Array.from(
    { length: Math.max(0, endPage - startPage) },
    (_, i) => startPage + i
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      {/* Left - Page Info & Page Size */}
      <div className="flex items-center gap-6">
        <p className="text-sm text-foreground">
          Showing <span className="font-semibold">{startIndex}–{endIndex}</span> of{" "}
          <span className="font-semibold">{totalItems}</span> {entityName}
        </p>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              table.setPageSize(Number(val));
            }}
          >
            <SelectTrigger size="sm" className="w-[70px] h-8">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right - navigation buttons */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <UIButton
          variant="outline"
          size="icon"
          onClick={() => table.firstPage?.() ?? table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="size-4" />
        </UIButton>

        {/* Previous page */}
        <UIButton
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="size-4" />
        </UIButton>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page) => (
            <UIButton
              key={page}
              variant={pageIndex === page ? "default" : "outline"}
              size="icon"
              onClick={() => table.setPageIndex(page)}
              aria-label={`Go to page ${page + 1}`}
            >
              {page + 1}
            </UIButton>
          ))}
        </div>

        {/* Next page */}
        <UIButton
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Go to next page"
        >
          <ChevronRight className="size-4" />
        </UIButton>

        {/* Last page */}
        <UIButton
          variant="outline"
          size="icon"
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Go to last page"
        >
          <ChevronsRight className="size-4" />
        </UIButton>
      </div>
    </div>
  );
}


