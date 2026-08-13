"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUpdateQueryParams } from "@/shared/hooks/use-update-query-params";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { CommonTable } from "@/components/common/CommonTable";
import { UIButton } from "@/components/common/UIButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { UIInput } from "@/components/common/UIInput/UIInput";
import { UISelect } from "@/components/common/UISelect/UISelect";
import { PageHeader, PageContainer } from "@/components/common";
import { Badge } from "@/components/ui/badge";

import {
  useWarehouses,
  useDeleteWarehouse,
} from "../queries/warehouses.queries";
import {
  WarehouseStatus,
  type IWarehouse,
  type WarehouseSortField,
  type SortOrder,
} from "../types/warehouses.types";
import { usePermissions, Page, Permission } from "@/permissions";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";
import { AddWarehouseButton } from "./add-warehouse-button";
import { PAGE_ROUTES } from "@/shared/constants/routes";

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
}

export function WarehousesContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateQueryParams = useUpdateQueryParams();

  const { can } = usePermissions();

  const [deletingWarehouse, setDeletingWarehouse] = useState<IWarehouse | null>(
    null,
  );
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Parse query parameters
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);
  const sortBy =
    (searchParams.get("sortBy") as WarehouseSortField) || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "DESC";
  const search = searchParams.get("search") || "";
  const status = (searchParams.get("status") as WarehouseStatus) || "";

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(search);
  }, [search]);

  // Debounce search input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateQueryParams({ search: searchInput, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, search, updateQueryParams]);

  // Fetch warehouses
  const { data, isLoading, isFetching, isError, error } = useWarehouses(
    {
      page,
      pageSize,
      sortBy,
      sortOrder,
      search: search || undefined,
      status: status || undefined,
    },
    {
      enabled: true,
    },
  );

  const { mutate: deleteWarehouse, isPending: isDeleting } =
    useDeleteWarehouse();

  useEffect(() => {
    if (isError) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || MESSAGES.WAREHOUSES.LOAD_FAILED,
        );
      } else {
        toast.error(MESSAGES.WAREHOUSES.LOAD_UNEXPECTED);
      }
    }
  }, [isError, error]);

  const handleOpenDeleteConfirm = useCallback((warehouse: IWarehouse) => {
    setDeletingWarehouse(warehouse);
    setIsConfirmDeleteOpen(true);
  }, []);

  const handleConfirmDelete = () => {
    if (!deletingWarehouse) return;

    deleteWarehouse(deletingWarehouse.id, {
      onSuccess: () => {
        toast.success(MESSAGES.WAREHOUSES.DELETE_SUCCESS);
        setIsConfirmDeleteOpen(false);
        setDeletingWarehouse(null);
      },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          toast.error(
            err.response?.data?.message || MESSAGES.WAREHOUSES.DELETE_FAILED,
          );
        } else {
          toast.error(MESSAGES.WAREHOUSES.DELETE_FAILED);
        }
      },
    });
  };

  const columns = useMemo<ColumnDef<IWarehouse>[]>(() => {
    const hasUpdatePermission = can(Page.Warehouses, Permission.UPDATE);
    const hasDeletePermission = can(Page.Warehouses, Permission.DELETE);

    return [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Warehouse Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {row.original.name}
            </span>
            {row.original.isDefault && (
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/80 border text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full select-none shrink-0">
                Default
              </Badge>
            )}
          </div>
        ),
      },

      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const wStatus = row.original.status;
          const statusColors: Record<WarehouseStatus, string> = {
            [WarehouseStatus.ACTIVE]:
              "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
            [WarehouseStatus.INACTIVE]:
              "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
          };

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                statusColors[wStatus] ||
                "bg-zinc-50 text-zinc-700 border-zinc-200"
              }`}
            >
              {wStatus}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      ...(hasUpdatePermission || hasDeletePermission
        ? [
            {
              id: "actions",
              header: () => <div className="text-right">Actions</div>,
              enableSorting: false,
              cell: ({ row }: { row: { original: IWarehouse } }) => (
                <div className="flex items-center gap-1.5">
                  {hasUpdatePermission && (
                    <UIButton
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="Edit warehouse"
                      onClick={() =>
                        router.push(
                          `${PAGE_ROUTES.WAREHOUSES}/edit/${row.original.id}`,
                        )
                      }
                    >
                      <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
                    </UIButton>
                  )}
                  {hasDeletePermission && (
                    <UIButton
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label="Delete warehouse"
                      onClick={() => handleOpenDeleteConfirm(row.original)}
                    >
                      <Trash2 className="size-4" />
                    </UIButton>
                  )}
                </div>
              ),
            },
          ]
        : []),
    ];
  }, [can, router, handleOpenDeleteConfirm]);

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active", value: WarehouseStatus.ACTIVE },
    { label: "Inactive", value: WarehouseStatus.INACTIVE },
  ];

  return (
    <PageContainer>
      <PageHeader title={TITLES.WAREHOUSES.WAREHOUSE_MANAGEMENT}>
        <div className="w-full sm:w-64">
          <UIInput
            placeholder="Search name or code..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 py-1"
          />
        </div>

        <div className="w-full sm:w-40 shrink-0">
          <UISelect
            mode="single"
            placeholder="Filter by status"
            options={statusOptions}
            value={status}
            onValueChange={(val) => {
              updateQueryParams({ status: val || "", page: 1 });
            }}
            className="h-9"
          />
        </div>

        {can(Page.Warehouses, Permission.CREATE) && (
          <>
            <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
            <AddWarehouseButton className="h-9" />
          </>
        )}
      </PageHeader>

      {/* Table with Server-Side Pagination */}
      <CommonTable
        data={data?.items ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        skeletonRowsCount={pageSize}
        pageSizeOptions={[5, 10, 20]}
        tableOptions={{
          enableSortingRemoval: false,
          manualPagination: true,
          manualSorting: true,
          pageCount: data?.totalPages ?? -1,
          rowCount: data?.totalItems ?? 0,
          state: {
            pagination: {
              pageIndex: page - 1,
              pageSize,
            },
            sorting: [
              {
                id: sortBy,
                desc: sortOrder === "DESC",
              },
            ],
          },
          onPaginationChange: (updater) => {
            const currentPagination = { pageIndex: page - 1, pageSize };
            const nextPagination =
              typeof updater === "function"
                ? updater(currentPagination)
                : updater;

            if (nextPagination.pageSize !== pageSize) {
              updateQueryParams({ page: 1, pageSize: nextPagination.pageSize });
            } else {
              updateQueryParams({ page: nextPagination.pageIndex + 1 });
            }
          },
          onSortingChange: (updater) => {
            const currentSorting = [{ id: sortBy, desc: sortOrder === "DESC" }];
            const nextSorting =
              typeof updater === "function" ? updater(currentSorting) : updater;

            if (nextSorting.length > 0) {
              const first = nextSorting[0];
              updateQueryParams({
                sortBy: first.id as WarehouseSortField,
                sortOrder: first.desc ? "DESC" : "ASC",
                page: 1,
              });
            }
          },
        }}
        emptyState={
          <div className="py-12 text-center text-sm text-muted-foreground">
            No warehouses found.
          </div>
        }
      />

      {/* Confirmation Dialog for Deletes */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Delete Warehouse"
        description={
          deletingWarehouse
            ? `Are you sure you want to delete the warehouse '${deletingWarehouse.name}'? This will also delete all of its linked contact persons. This action cannot be undone.`
            : "Are you sure you want to delete this warehouse?"
        }
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}
