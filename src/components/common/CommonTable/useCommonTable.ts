/* eslint-disable react-hooks/incompatible-library */
import { useState } from "react";
import type { CommonTableProps } from "./types";
import type {
  SortingState,
  TableOptions} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";

export type UseCommonTableProps<TData> = CommonTableProps<TData> & {
  tableOptions?: Partial<TableOptions<TData>>;
};

export function useCommonTable<TData>({
  data,
  columns,
  tableOptions,
}: UseCommonTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);

  const isSortingControlled = tableOptions?.state?.sorting !== undefined;
  const activeSorting = tableOptions?.state?.sorting ?? internalSorting;

  const table = useReactTable({
    ...tableOptions,

    data,
    columns,

    state: {
      ...tableOptions?.state,
      sorting: activeSorting,
    },
    onSortingChange: (updater) => {
      if (!isSortingControlled) {
        setInternalSorting(updater);
      }
      tableOptions?.onSortingChange?.(updater);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
      ...tableOptions?.initialState,
    },
  });

  return table;
}

