"use client";

import * as React from "react";
import {
  Table,
} from "@/components/ui/table";
import { CommonTableHeader } from "./CommonTableHeader";
import { CommonTableBody } from "./CommonTableBody";
import { CommonTablePagination } from "./CommonTablePagination";
import { useCommonTable } from "./useCommonTable";
import type { CommonTableProps } from "./types";

function CommonTableComponent<TData>({
  data,
  columns,
  isLoading = false,
  tableOptions,
  emptyState,
  pageSizeOptions,
  skeletonRowsCount,
  entityName,
}: CommonTableProps<TData>) {
  const table = useCommonTable({ data, columns, tableOptions });

  return (
    <div className="flex flex-col gap-2">
      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <CommonTableHeader table={table} />
          <CommonTableBody
            table={table}
            isLoading={isLoading}
            emptyState={emptyState}
            skeletonRowsCount={skeletonRowsCount}
          />
        </Table>
      </div>

      {/* Pagination */}
      <CommonTablePagination
        table={table}
        pageSizeOptions={pageSizeOptions}
        entityName={entityName}
      />
    </div>
  );
}

export const CommonTable = React.memo(CommonTableComponent) as <TData>(
  props: CommonTableProps<TData>
) => React.ReactElement;
