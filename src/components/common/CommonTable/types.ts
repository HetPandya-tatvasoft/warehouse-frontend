import type { ColumnDef, TableOptions } from "@tanstack/react-table";

export type { ColumnDef }

export type CommonTableProps<TData> = {
    data: TData[];
    columns: ColumnDef<TData>[];
    isLoading?: boolean;
    tableOptions?: Partial<TableOptions<TData>>;
    emptyState?: React.ReactNode;
    pageSizeOptions?: number[];
    skeletonRowsCount?: number;
    entityName?: string;
}
