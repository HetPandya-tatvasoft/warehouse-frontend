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
  BrandStatus,
  type IBrand,
  type BrandSortField,
  type SortOrder,
  type IGetBrandsParams,
} from "../types/brands.types";
import {
  useBrands,
  useUpdateBrand,
  useDeleteBrand,
} from "../queries/brands.queries";
import { BrandFormModal } from "./brand-form-modal";

const statusColors: Record<BrandStatus, string> = {
  [BrandStatus.ACTIVE]:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  [BrandStatus.INACTIVE]:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
};

const statusFilterOptions = [
  { label: "All Status", value: "" },
  { label: "Active", value: BrandStatus.ACTIVE },
  { label: "Inactive", value: BrandStatus.INACTIVE },
];

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
}

export function BrandsContainer() {
  const searchParams = useSearchParams();
  const updateQueryParams = useUpdateQueryParams();
  const { can } = usePermissions();

  const canView = can(Page.Brands, Permission.VIEW);
  const canCreate = can(Page.Brands, Permission.CREATE);
  const canUpdate = can(Page.Brands, Permission.UPDATE);
  const canDelete = can(Page.Brands, Permission.DELETE);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedBrandForEdit, setSelectedBrandForEdit] =
    useState<IBrand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<IBrand | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);

  // URL Controls
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);
  const sortBy = (searchParams.get("sortBy") as BrandSortField) || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "DESC";
  const search = searchParams.get("search") || "";
  const status = (searchParams.get("status") as BrandStatus) || "";

  const controls: IGetBrandsParams = {
    page,
    pageSize,
    sortBy,
    sortOrder,
    search: search || undefined,
    status: (status as BrandStatus) || undefined,
  };

  const [searchInput, setSearchInput] = useSyncedState(search);
  const debouncedSearch = useDebounce(searchInput);

  // Debounced search query parameter synchronization
  useEffect(() => {
    if (searchInput === debouncedSearch && debouncedSearch.trim() !== search) {
      updateQueryParams({ search: debouncedSearch.trim(), page: 1 });
    }
  }, [debouncedSearch, searchInput, search, updateQueryParams]);

  const query = useBrands(controls, { enabled: canView });

  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand();
  const { mutate: deleteBrand, isPending: isDeleting } = useDeleteBrand();

  const isPendingAction = isUpdating || isDeleting;

  // Beyond-last page recovery
  useEffect(() => {
    if (
      !query.isFetching &&
      !query.isError &&
      query.data &&
      query.data.page === controls.page
    ) {
      const lastPage = Math.max(1, query.data.totalPages);
      if (controls.page > lastPage) {
        updateQueryParams({ page: lastPage });
      }
    }
  }, [
    query.isFetching,
    query.isError,
    query.data,
    controls.page,
    updateQueryParams,
  ]);

  // Error toast notification
  useEffect(() => {
    if (query.isError) {
      const message = axios.isAxiosError<IApiErrorResponse>(query.error)
        ? query.error.response?.data?.message ||
          MESSAGES.PRODUCT_BRANDS.LOAD_FAILED
        : MESSAGES.PRODUCT_BRANDS.LOAD_UNEXPECTED;
      toast.error(message);
    }
  }, [query.isError, query.error]);

  const handleOpenCreateModal = useCallback(() => {
    if (!canCreate) return;
    setSelectedBrandForEdit(null);
    setIsFormModalOpen(true);
  }, [canCreate]);

  const handleOpenEditModal = useCallback(
    (brand: IBrand) => {
      if (!canUpdate) return;
      setSelectedBrandForEdit(brand);
      setIsFormModalOpen(true);
    },
    [canUpdate],
  );

  const handleOpenDeleteConfirm = useCallback(
    (brand: IBrand) => {
      if (!canDelete) return;
      setDeletingBrand(brand);
      setIsConfirmDeleteOpen(true);
    },
    [canDelete],
  );

  const handleToggleStatus = useCallback(
    (brand: IBrand) => {
      if (!canView || !canUpdate || isPendingAction || statusTogglingId) return;

      const nextStatus =
        brand.status === BrandStatus.ACTIVE
          ? BrandStatus.INACTIVE
          : BrandStatus.ACTIVE;

      setStatusTogglingId(brand.id);
      updateBrand(
        {
          id: brand.id,
          payload: {
            name: brand.name,
            status: nextStatus,
          },
        },
        {
          onSuccess: (res) => {
            toast.success(res?.message);
            setStatusTogglingId(null);
          },
          onError: (error) => {
            setStatusTogglingId(null);
            if (axios.isAxiosError<IApiErrorResponse>(error)) {
              if (error.response?.status !== 403) {
                toast.error(
                  error.response?.data?.message ||
                    MESSAGES.PRODUCT_BRANDS.UPDATE_FAILED,
                );
              }
              if (error.response?.status === 404) {
                void query.refetch();
              }
            } else {
              toast.error(MESSAGES.COMMON.UNEXPECTED_ERROR);
            }
          },
        },
      );
    },
    [canView, canUpdate, isPendingAction, statusTogglingId, updateBrand, query],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deletingBrand || !canView || !canDelete || isPendingAction) return;

    deleteBrand(deletingBrand.id, {
      onSuccess: (res) => {
        toast.success(res?.message);
        setIsConfirmDeleteOpen(false);
        setDeletingBrand(null);
      },
      onError: (err) => {
        if (axios.isAxiosError<IApiErrorResponse>(err)) {
          if (err.response?.status !== 403) {
            toast.error(
              err.response?.data?.message ||
                MESSAGES.PRODUCT_BRANDS.DELETE_FAILED,
            );
          }
          if (err.response?.status === 404) {
            void query.refetch();
          }
        } else {
          toast.error(MESSAGES.COMMON.UNEXPECTED_ERROR);
        }
      },
    });
  }, [deletingBrand, canView, canDelete, isPendingAction, deleteBrand, query]);

  const columns = useMemo<ColumnDef<IBrand>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: () => <div className="w-full text-center">Brand Name</div>,
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
        accessorKey: "status",
        header: () => <div className="w-full text-center">Status</div>,
        enableSorting: true,
        cell: ({ row }) => {
          const brandStatus = row.original.status;
          return (
            <div className="flex items-center justify-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  statusColors[brandStatus] ||
                  "bg-zinc-50 text-zinc-700 border-zinc-200"
                }`}
              >
                {brandStatus === BrandStatus.ACTIVE ? "Active" : "Inactive"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: () => <div className="w-full text-center">Created At</div>,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: () => <div className="w-full text-center">Updated At</div>,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(row.original.updatedAt)}
          </div>
        ),
      },
      ...(canUpdate || canDelete
        ? [
            {
              id: "actions",
              header: () => <div className="w-full text-center">Actions</div>,
              enableSorting: false,
              cell: ({ row }: { row: { original: IBrand } }) => {
                const brand = row.original;
                const isToggling = statusTogglingId === brand.id;
                return (
                  <div className="flex items-center justify-center gap-1.5">
                    {canUpdate && (
                      <>
                        <UIButton
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label="Edit brand"
                          disabled={isPendingAction}
                          onClick={() => handleOpenEditModal(brand)}
                        >
                          <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
                        </UIButton>
                        <UIButton
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-medium"
                          disabled={isPendingAction || isToggling}
                          onClick={() => void handleToggleStatus(brand)}
                        >
                          {brand.status === BrandStatus.ACTIVE
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
                        aria-label="Delete brand"
                        disabled={isPendingAction}
                        onClick={() => handleOpenDeleteConfirm(brand)}
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
      <PageHeader title={TITLES.PRODUCT_BRANDS.BRAND_MANAGEMENT}>
        <div className="w-full sm:w-64">
          <UIInput
            aria-label="Search brands"
            placeholder="Search brands..."
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
              Add Brand
            </UIButton>
          </>
        )}
      </PageHeader>

      {query.isError ? (
        <UIErrorState
          title={MESSAGES.PRODUCT_BRANDS.LOAD_FAILED}
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
          entityName="brands"
          emptyState={
            <div className="py-12 text-center text-sm text-muted-foreground">
              {controls.search || controls.status
                ? MESSAGES.PRODUCT_BRANDS.EMPTY_SEARCH_STATE
                : MESSAGES.PRODUCT_BRANDS.EMPTY_STATE}
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
                  sortBy: first.id as BrandSortField,
                  sortOrder: first.desc ? "DESC" : "ASC",
                  page: 1,
                });
              }
            },
          }}
        />
      )}

      {/* Form Modal (Create / Edit) */}
      <BrandFormModal
        open={isFormModalOpen}
        onOpenChange={(open) => {
          setIsFormModalOpen(open);
          if (!open) setSelectedBrandForEdit(null);
        }}
        brand={selectedBrandForEdit}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={(open) => {
          if (!isPendingAction) {
            setIsConfirmDeleteOpen(open);
            if (!open) setDeletingBrand(null);
          }
        }}
        title="Delete Brand"
        description={
          deletingBrand
            ? `Are you sure you want to delete "${deletingBrand.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this brand? This action cannot be undone."
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
