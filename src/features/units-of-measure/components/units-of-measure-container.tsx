"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUpdateQueryParams } from "@/shared/hooks/use-update-query-params";
import { useSyncedState } from "@/shared/hooks/use-synced-state";
import { useDebounce } from "@/shared/hooks/use-debounce";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import type { IApiErrorResponse } from "@/types/api.types";
import { CommonTable } from "@/components/common/CommonTable";
import { UIButton } from "@/components/common/UIButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { UIInput } from "@/components/common/UIInput/UIInput";
import { UISelect } from "@/components/common/UISelect/UISelect";
import { PageHeader, PageContainer, UIErrorState } from "@/components/common";
import { usePermissions, Page, Permission } from "@/permissions";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";

import {
  UnitOfMeasureStatus,
  type IUnitOfMeasure,
  type UnitOfMeasureSortField,
  type SortOrder,
  type IGetUnitsOfMeasureParams,
} from "../types/units-of-measure.types";
import {
  useUnitsOfMeasure,
  useUpdateUnitOfMeasure,
  useDeleteUnitOfMeasure,
} from "../queries/units-of-measure.queries";
import { UnitOfMeasureFormModal } from "./unit-of-measure-form-modal";

const statusColors: Record<UnitOfMeasureStatus, string> = {
  [UnitOfMeasureStatus.ACTIVE]:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  [UnitOfMeasureStatus.INACTIVE]:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
};

const statusFilterOptions = [
  { label: "All Status", value: "" },
  { label: "Active", value: UnitOfMeasureStatus.ACTIVE },
  { label: "Inactive", value: UnitOfMeasureStatus.INACTIVE },
];

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
}

export function UnitsOfMeasureContainer() {
  const searchParams = useSearchParams();
  const updateQueryParams = useUpdateQueryParams();
  const { can } = usePermissions();

  const canView = can(Page.UnitsOfMeasure, Permission.VIEW);
  const canCreate = can(Page.UnitsOfMeasure, Permission.CREATE);
  const canUpdate = can(Page.UnitsOfMeasure, Permission.UPDATE);
  const canDelete = can(Page.UnitsOfMeasure, Permission.DELETE);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedUnitForEdit, setSelectedUnitForEdit] =
    useState<IUnitOfMeasure | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<IUnitOfMeasure | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);

  // URL Controls
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);
  const sortBy =
    (searchParams.get("sortBy") as UnitOfMeasureSortField) || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "DESC";
  const search = searchParams.get("search") || "";
  const status = (searchParams.get("status") as UnitOfMeasureStatus) || "";

  const controls: IGetUnitsOfMeasureParams = {
    page,
    pageSize,
    sortBy,
    sortOrder,
    search: search || undefined,
    status: (status as UnitOfMeasureStatus) || undefined,
  };

  const [searchInput, setSearchInput] = useSyncedState(search);
  const debouncedSearch = useDebounce(searchInput);

  // Debounced search query parameter synchronization
  useEffect(() => {
    if (searchInput === debouncedSearch && debouncedSearch.trim() !== search) {
      updateQueryParams({ search: debouncedSearch.trim(), page: 1 });
    }
  }, [debouncedSearch, searchInput, search, updateQueryParams]);

  const query = useUnitsOfMeasure(controls, { enabled: canView });

  const { mutate: updateUnit, isPending: isUpdating } = useUpdateUnitOfMeasure();
  const { mutate: deleteUnit, isPending: isDeleting } = useDeleteUnitOfMeasure();

  const isPendingAction = isUpdating || isDeleting;

  // Error toast notification
  useEffect(() => {
    if (query.isError) {
      const message = axios.isAxiosError<IApiErrorResponse>(query.error)
        ? query.error.response?.data?.message ||
          MESSAGES.PRODUCT_UNITS_OF_MEASURE.LOAD_FAILED
        : MESSAGES.PRODUCT_UNITS_OF_MEASURE.LOAD_UNEXPECTED;
      toast.error(message);
    }
  }, [query.isError, query.error]);

  const handleOpenCreateModal = useCallback(() => {
    if (!canCreate) return;
    setSelectedUnitForEdit(null);
    setIsFormModalOpen(true);
  }, [canCreate]);

  const handleOpenEditModal = useCallback(
    (unit: IUnitOfMeasure) => {
      if (!canUpdate) return;
      setSelectedUnitForEdit(unit);
      setIsFormModalOpen(true);
    },
    [canUpdate],
  );

  const handleOpenDeleteConfirm = useCallback(
    (unit: IUnitOfMeasure) => {
      if (!canDelete) return;
      setDeletingUnit(unit);
      setIsConfirmDeleteOpen(true);
    },
    [canDelete],
  );

  const handleToggleStatus = useCallback(
    (unit: IUnitOfMeasure) => {
      if (!canView || !canUpdate || isPendingAction || statusTogglingId) return;

      const nextStatus =
        unit.status === UnitOfMeasureStatus.ACTIVE
          ? UnitOfMeasureStatus.INACTIVE
          : UnitOfMeasureStatus.ACTIVE;

      setStatusTogglingId(unit.id);
      updateUnit(
        {
          id: unit.id,
          payload: {
            status: nextStatus,
          },
        },
        {
          onSuccess: (res) => {
            toast.success(
              res?.message ||
                (nextStatus === UnitOfMeasureStatus.ACTIVE
                  ? MESSAGES.PRODUCT_UNITS_OF_MEASURE.STATUS_ACTIVATED
                  : MESSAGES.PRODUCT_UNITS_OF_MEASURE.STATUS_DEACTIVATED),
            );
            setStatusTogglingId(null);
          },
          onError: (error) => {
            setStatusTogglingId(null);
            if (axios.isAxiosError<IApiErrorResponse>(error)) {
              toast.error(
                error.response?.data?.message ||
                  MESSAGES.PRODUCT_UNITS_OF_MEASURE.UPDATE_FAILED,
              );
            } else {
              toast.error(MESSAGES.COMMON.UNEXPECTED_ERROR);
            }
          },
        },
      );
    },
    [canView, canUpdate, isPendingAction, statusTogglingId, updateUnit],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deletingUnit || !canView || !canDelete || isPendingAction) return;

    deleteUnit(deletingUnit.id, {
      onSuccess: (res) => {
        toast.success(
          res?.message || MESSAGES.PRODUCT_UNITS_OF_MEASURE.DELETE_SUCCESS,
        );
        setIsConfirmDeleteOpen(false);
        setDeletingUnit(null);
      },
      onError: (err) => {
        if (axios.isAxiosError<IApiErrorResponse>(err)) {
          toast.error(
            err.response?.data?.message ||
              MESSAGES.PRODUCT_UNITS_OF_MEASURE.DELETE_FAILED,
          );
        } else {
          toast.error(MESSAGES.COMMON.UNEXPECTED_ERROR);
        }
      },
    });
  }, [deletingUnit, canView, canDelete, isPendingAction, deleteUnit]);

  const columns = useMemo<ColumnDef<IUnitOfMeasure>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: () => <div className="w-full text-center">Name</div>,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 break-words">
              {row.original.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "code",
        header: () => <div className="w-full text-center">Code</div>,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              {row.original.code}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "allowsFractionalQuantity",
        header: () => (
          <div className="w-full text-center">Fractional Quantities</div>
        ),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {row.original.allowsFractionalQuantity ? "Yes" : "No"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: () => <div className="w-full text-center">Status</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const uomStatus = row.original.status;
          return (
            <div className="flex items-center justify-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  statusColors[uomStatus] ||
                  "bg-zinc-50 text-zinc-700 border-zinc-200"
                }`}
              >
                {uomStatus === UnitOfMeasureStatus.ACTIVE ? "Active" : "Inactive"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: () => <div className="w-full text-center">Created Date</div>,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      },
      ...(canUpdate || canDelete
        ? [
            {
              id: "actions",
              header: () => <div className="w-full text-center">Actions</div>,
              enableSorting: false,
              cell: ({ row }: { row: { original: IUnitOfMeasure } }) => {
                const unit = row.original;
                const isToggling = statusTogglingId === unit.id;
                return (
                  <div className="flex items-center justify-center gap-1.5">
                    {canUpdate && (
                      <>
                        <UIButton
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label="Edit unit of measure"
                          disabled={isPendingAction}
                          onClick={() => handleOpenEditModal(unit)}
                        >
                          <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
                        </UIButton>
                        <UIButton
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-medium"
                          disabled={isPendingAction || isToggling}
                          onClick={() => void handleToggleStatus(unit)}
                        >
                          {unit.status === UnitOfMeasureStatus.ACTIVE
                            ? "Deactivate"
                            : "Reactivate"}
                        </UIButton>
                      </>
                    )}
                    {canDelete && (
                      <UIButton
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        aria-label="Delete unit of measure"
                        disabled={isPendingAction}
                        onClick={() => handleOpenDeleteConfirm(unit)}
                      >
                        <Trash2 className="size-4" />
                      </UIButton>
                    )}
                  </div>
                );
              },
            },
          ]
        : []),
    ];
  }, [
    canUpdate,
    canDelete,
    isPendingAction,
    statusTogglingId,
    handleOpenEditModal,
    handleToggleStatus,
    handleOpenDeleteConfirm,
  ]);

  const queryErrorMessage = axios.isAxiosError<IApiErrorResponse>(query.error)
    ? query.error.response?.data?.message || MESSAGES.COMMON.UNEXPECTED_ERROR
    : MESSAGES.COMMON.UNEXPECTED_ERROR;

  return (
    <PageContainer>
      <PageHeader title={TITLES.PRODUCT_UNITS_OF_MEASURE.UOM_MANAGEMENT}>
        <div className="w-full sm:w-64">
          <UIInput
            aria-label="Search units of measure"
            placeholder="Search by name or code..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 py-1"
          />
        </div>

        <div className="w-full sm:w-40 shrink-0">
          <UISelect
            mode="single"
            placeholder="Filter by status"
            options={statusFilterOptions}
            value={status}
            onValueChange={(val) => {
              updateQueryParams({ status: val || "", page: 1 });
            }}
            className="h-9"
          />
        </div>

        {canCreate && (
          <>
            <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
            <UIButton
              leftIcon={<Plus className="size-4" />}
              onClick={handleOpenCreateModal}
              disabled={isPendingAction}
              className="h-9"
            >
              Add Unit of Measure
            </UIButton>
          </>
        )}
      </PageHeader>

      {query.isError ? (
        <UIErrorState
          title={MESSAGES.PRODUCT_UNITS_OF_MEASURE.LOAD_FAILED}
          description={queryErrorMessage}
          actionText="Try Again"
          onAction={() => {
            void query.refetch();
          }}
        />
      ) : (
        <CommonTable
          data={query.data?.items ?? []}
          columns={columns}
          isLoading={query.isLoading || query.isFetching}
          skeletonRowsCount={pageSize}
          pageSizeOptions={[10, 25, 50]}
          entityName="units of measure"
          emptyState={
            <div className="py-12 text-center text-sm text-muted-foreground">
              {controls.search || controls.status
                ? MESSAGES.PRODUCT_UNITS_OF_MEASURE.EMPTY_SEARCH_STATE
                : MESSAGES.PRODUCT_UNITS_OF_MEASURE.EMPTY_STATE}
            </div>
          }
          tableOptions={{
            enableSortingRemoval: false,
            manualPagination: true,
            manualSorting: true,
            pageCount: query.data?.totalPages ?? -1,
            rowCount: query.data?.totalItems ?? 0,
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
                updateQueryParams({
                  page: 1,
                  pageSize: nextPagination.pageSize,
                });
              } else {
                updateQueryParams({ page: nextPagination.pageIndex + 1 });
              }
            },
            onSortingChange: (updater) => {
              const currentSorting = [
                { id: sortBy, desc: sortOrder === "DESC" },
              ];
              const nextSorting =
                typeof updater === "function"
                  ? updater(currentSorting)
                  : updater;

              if (nextSorting.length > 0) {
                const first = nextSorting[0];
                updateQueryParams({
                  sortBy: first.id as UnitOfMeasureSortField,
                  sortOrder: first.desc ? "DESC" : "ASC",
                  page: 1,
                });
              }
            },
          }}
        />
      )}

      {/* Form Modal (Create / Edit) */}
      <UnitOfMeasureFormModal
        open={isFormModalOpen}
        onOpenChange={(open) => {
          setIsFormModalOpen(open);
          if (!open) setSelectedUnitForEdit(null);
        }}
        unit={selectedUnitForEdit}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={(open) => {
          if (!isPendingAction) {
            setIsConfirmDeleteOpen(open);
            if (!open) setDeletingUnit(null);
          }
        }}
        title="Delete Unit of Measure"
        description={
          deletingUnit
            ? `Are you sure you want to delete "${deletingUnit.name}" (${deletingUnit.code})? This action is permanent and cannot be undone.`
            : "Are you sure you want to delete this unit of measure? This action is permanent and cannot be undone."
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}
