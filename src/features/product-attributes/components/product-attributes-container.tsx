"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import type { IApiErrorResponse } from "@/types/api.types";
import {
  CommonTable,
  PageContainer,
  PageHeader,
  UIInput,
  UISelect,
  UIButton,
  UIErrorState,
} from "@/components/common";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { Page, Permission, usePermissions } from "@/permissions";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";
import { useUpdateQueryParams } from "@/shared/hooks/use-update-query-params";
import { useSyncedState } from "@/shared/hooks/use-synced-state";
import { useDebounce } from "@/shared/hooks/use-debounce";
import {
  ProductAttributeStatus,
  type IProductAttribute,
  type IGetAttributesParams,
  type AttributeSortField,
  type SortOrder,
} from "../types/product-attributes.types";
import {
  useAttributes,
  useUpdateAttribute,
  useDeleteAttribute,
} from "../queries/product-attributes.queries";
import { AttributeFormModal } from "./attribute-form-modal";

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
}

const statusFilterOptions = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: ProductAttributeStatus.ACTIVE },
  { label: "Inactive", value: ProductAttributeStatus.INACTIVE },
];

const statusColors: Record<ProductAttributeStatus, string> = {
  [ProductAttributeStatus.ACTIVE]:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  [ProductAttributeStatus.INACTIVE]:
    "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
};

export function ProductAttributesContainer() {
  const searchParams = useSearchParams();
  const updateQueryParams = useUpdateQueryParams();

  const { can } = usePermissions();
  const canView = can(Page.ProductAttributes, Permission.VIEW);
  const canCreate = can(Page.ProductAttributes, Permission.CREATE);
  const canUpdate = can(Page.ProductAttributes, Permission.UPDATE);
  const canDelete = can(Page.ProductAttributes, Permission.DELETE);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAttributeForEdit, setSelectedAttributeForEdit] =
    useState<IProductAttribute | null>(null);

  const [deletingAttribute, setDeletingAttribute] =
    useState<IProductAttribute | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);
  const sortBy =
    searchParams.get("sortBy") === "name" ? "name" : ("createdAt" as AttributeSortField);
  const sortOrder =
    (searchParams.get("sortOrder") as SortOrder) === "ASC" ? "ASC" : "DESC";
  const search = searchParams.get("search")?.trim() || "";
  const rawStatus = searchParams.get("status");
  const status =
    rawStatus === ProductAttributeStatus.ACTIVE ||
    rawStatus === ProductAttributeStatus.INACTIVE
      ? rawStatus
      : "";

  const controls: IGetAttributesParams = {
    page,
    pageSize,
    sortBy,
    sortOrder,
    search: search || undefined,
    status: (status as ProductAttributeStatus) || undefined,
  };

  const [searchInput, setSearchInput] = useSyncedState(search);
  const debouncedSearch = useDebounce(searchInput);

  // Debounced search query parameter synchronization
  useEffect(() => {
    if (
      searchInput === debouncedSearch &&
      debouncedSearch.trim() !== search
    ) {
      updateQueryParams({ search: debouncedSearch.trim(), page: 1 });
    }
  }, [debouncedSearch, searchInput, search, updateQueryParams]);

  const query = useAttributes(controls, { enabled: canView });

  const { mutate: updateAttribute, isPending: isUpdating } = useUpdateAttribute();
  const { mutate: deleteAttribute, isPending: isDeleting } = useDeleteAttribute();

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

  // Display query errors through toast
  useEffect(() => {
    if (query.isError) {
      if (axios.isAxiosError(query.error)) {
        toast.error(
          query.error.response?.data?.message ||
            MESSAGES.PRODUCT_ATTRIBUTES.LOAD_FAILED,
        );
      } else {
        toast.error(MESSAGES.PRODUCT_ATTRIBUTES.LOAD_UNEXPECTED);
      }
    }
  }, [query.isError, query.error]);

  const handleOpenCreateModal = useCallback(() => {
    setSelectedAttributeForEdit(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((attribute: IProductAttribute) => {
    setSelectedAttributeForEdit(attribute);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenDeleteConfirm = useCallback(
    (attribute: IProductAttribute) => {
      setDeletingAttribute(attribute);
      setIsConfirmDeleteOpen(true);
    },
    [],
  );

  const handleToggleStatus = useCallback(
    (attribute: IProductAttribute) => {
      if (!canView || !canUpdate || isPendingAction || statusTogglingId) return;

      const nextStatus =
        attribute.status === ProductAttributeStatus.ACTIVE
          ? ProductAttributeStatus.INACTIVE
          : ProductAttributeStatus.ACTIVE;

      setStatusTogglingId(attribute.id);
      updateAttribute(
        {
          id: attribute.id,
          payload: {
            name: attribute.name,
            status: nextStatus,
          },
        },
        {
          onSuccess: (res) => {
            toast.success(
              res?.message ||
                (nextStatus === ProductAttributeStatus.ACTIVE
                  ? MESSAGES.PRODUCT_ATTRIBUTES.STATUS_ACTIVATED
                  : MESSAGES.PRODUCT_ATTRIBUTES.STATUS_DEACTIVATED),
            );
            setStatusTogglingId(null);
          },
          onError: (error) => {
            setStatusTogglingId(null);
            const message = axios.isAxiosError<IApiErrorResponse>(error)
              ? error.response?.data?.message ||
                MESSAGES.PRODUCT_ATTRIBUTES.UPDATE_FAILED
              : MESSAGES.COMMON.UNEXPECTED_ERROR;
            if (
              !(
                axios.isAxiosError<unknown>(error) &&
                error.response?.status === 403
              )
            ) {
              toast.error(message);
            }
            if (
              axios.isAxiosError<unknown>(error) &&
              error.response?.status === 404
            ) {
              void query.refetch();
            }
          },
        },
      );
    },
    [canView, canUpdate, isPendingAction, statusTogglingId, updateAttribute, query],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deletingAttribute || !canView || !canDelete || isPendingAction) return;

    deleteAttribute(deletingAttribute.id, {
      onSuccess: (res) => {
        toast.success(
          res?.message || MESSAGES.PRODUCT_ATTRIBUTES.DELETE_SUCCESS,
        );
        setIsConfirmDeleteOpen(false);
        setDeletingAttribute(null);
      },
      onError: (error) => {
        const message = axios.isAxiosError<IApiErrorResponse>(error)
          ? error.response?.data?.message ||
            MESSAGES.PRODUCT_ATTRIBUTES.DELETE_FAILED
          : MESSAGES.COMMON.UNEXPECTED_ERROR;
        if (
          !(
            axios.isAxiosError<unknown>(error) &&
            error.response?.status === 403
          )
        ) {
          toast.error(message);
        }
        if (
          axios.isAxiosError<unknown>(error) &&
          error.response?.status === 404
        ) {
          void query.refetch();
        }
      },
    });
  }, [deletingAttribute, canView, canDelete, isPendingAction, deleteAttribute, query]);

  const columns = useMemo<ColumnDef<IProductAttribute>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Attribute Name",
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 break-words">
              {row.original.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "valueCount",
        header: "Values",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-zinc-600 dark:text-zinc-300">
            {row.original.valueCount}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
          const attributeStatus = row.original.status;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                statusColors[attributeStatus] ||
                "bg-zinc-50 text-zinc-700 border-zinc-200"
              }`}
            >
              {attributeStatus === ProductAttributeStatus.ACTIVE
                ? "Active"
                : "Inactive"}
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
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const attribute = row.original;
          const isToggling = statusTogglingId === attribute.id;

          return (
            <div className="flex items-center justify-end gap-1.5">
              <Link
                href={`${PAGE_ROUTES.PRODUCT_ATTRIBUTES}/${encodeURIComponent(attribute.id)}/values`}
                className="text-xs font-medium text-primary hover:underline underline-offset-4 mr-1 whitespace-nowrap"
              >
                Manage Values
              </Link>

              {canUpdate && (
                <>
                  <UIButton
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="Edit attribute"
                    disabled={isPendingAction}
                    onClick={() => handleOpenEditModal(attribute)}
                  >
                    <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
                  </UIButton>
                  <UIButton
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-medium"
                    disabled={isPendingAction || isToggling}
                    onClick={() => void handleToggleStatus(attribute)}
                  >
                    {attribute.status === ProductAttributeStatus.ACTIVE
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
                  aria-label="Delete attribute"
                  disabled={isPendingAction}
                  onClick={() => handleOpenDeleteConfirm(attribute)}
                >
                  <Trash2 className="size-4" />
                </UIButton>
              )}
            </div>
          );
        },
      },
    ];
  }, [
    canUpdate,
    canDelete,
    isPendingAction,
    statusTogglingId,
    handleOpenEditModal,
    handleOpenDeleteConfirm,
    handleToggleStatus,
  ]);

  const queryErrorMessage = axios.isAxiosError<IApiErrorResponse>(query.error)
    ? query.error.response?.data?.message || MESSAGES.COMMON.UNEXPECTED_ERROR
    : MESSAGES.COMMON.UNEXPECTED_ERROR;

  return (
    <PageContainer>
      <PageHeader title={TITLES.PRODUCT_ATTRIBUTES.MANAGEMENT}>
        <div className="w-full sm:w-64">
          <UIInput
            aria-label="Search attributes"
            placeholder="Search attributes..."
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
              Add Attribute
            </UIButton>
          </>
        )}
      </PageHeader>

      {query.isError ? (
        <UIErrorState
          title="Failed to load attributes"
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
          pageSizeOptions={[5, 10, 20]}
          entityName="attributes"
          emptyState={
            <div className="py-12 text-center text-sm text-muted-foreground">
              {controls.search || controls.status
                ? "No matching attributes found. Try adjusting your search or filters."
                : "No attributes found."}
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
                pageIndex: controls.page - 1,
                pageSize: controls.pageSize,
              },
              sorting: [
                {
                  id: controls.sortBy,
                  desc: controls.sortOrder === "DESC",
                },
              ],
            },
            onPaginationChange: (updater) => {
              const current = {
                pageIndex: controls.page - 1,
                pageSize: controls.pageSize,
              };
              const next =
                typeof updater === "function" ? updater(current) : updater;

              if (next.pageSize !== controls.pageSize) {
                updateQueryParams({ page: 1, pageSize: next.pageSize });
              } else {
                updateQueryParams({ page: next.pageIndex + 1 });
              }
            },
            onSortingChange: (updater) => {
              const current = [
                {
                  id: controls.sortBy,
                  desc: controls.sortOrder === "DESC",
                },
              ];
              const next =
                typeof updater === "function" ? updater(current) : updater;
              const first = next[0];

              if (first && (first.id === "name" || first.id === "createdAt")) {
                updateQueryParams({
                  sortBy: first.id,
                  sortOrder: first.desc ? "DESC" : "ASC",
                  page: 1,
                });
              }
            },
          }}
        />
      )}

      {/* Form Modal (Create / Edit) */}
      <AttributeFormModal
        open={isFormModalOpen}
        onOpenChange={(open) => {
          setIsFormModalOpen(open);
          if (!open) setSelectedAttributeForEdit(null);
        }}
        attribute={selectedAttributeForEdit}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={(open) => {
          if (!isPendingAction) {
            setIsConfirmDeleteOpen(open);
            if (!open) setDeletingAttribute(null);
          }
        }}
        title="Delete Attribute"
        description={
          deletingAttribute
            ? `Permanently delete "${deletingAttribute.name}" and all of its values? This cannot be undone.`
            : "Are you sure you want to delete this attribute?"
        }
        confirmText="Delete Permanently"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}
