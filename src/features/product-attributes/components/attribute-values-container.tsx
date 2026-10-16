"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowLeft, Info, Pencil, Plus, Trash2 } from "lucide-react";
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
  UILoader,
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
  type IAttributeValue,
  type IGetAttributeValuesParams,
  type SortOrder,
} from "../types/product-attributes.types";
import {
  useAttribute,
  useAttributeValues,
  useUpdateAttributeValue,
  useDeleteAttributeValue,
} from "../queries/product-attributes.queries";
import { AttributeValueFormModal } from "./attribute-value-form-modal";

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

export function AttributeValuesContainer({
  attributeId,
}: {
  attributeId: string;
}) {
  const searchParams = useSearchParams();
  const updateQueryParams = useUpdateQueryParams();

  const { can } = usePermissions();
  const canView = can(Page.ProductAttributes, Permission.VIEW);
  const canCreate = can(Page.ProductAttributes, Permission.CREATE);
  const canUpdate = can(Page.ProductAttributes, Permission.UPDATE);
  const canDelete = can(Page.ProductAttributes, Permission.DELETE);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedValueForEdit, setSelectedValueForEdit] =
    useState<IAttributeValue | null>(null);

  const [deletingValue, setDeletingValue] = useState<IAttributeValue | null>(
    null,
  );
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);
  const sortOrder =
    (searchParams.get("sortOrder") as SortOrder) === "ASC" ? "ASC" : "DESC";
  const search = searchParams.get("search")?.trim() || "";
  const rawStatus = searchParams.get("status");
  const status =
    rawStatus === ProductAttributeStatus.ACTIVE ||
    rawStatus === ProductAttributeStatus.INACTIVE
      ? rawStatus
      : "";

  const controls: IGetAttributeValuesParams = {
    page,
    pageSize,
    sortBy: "createdAt",
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

  const parent = useAttribute(attributeId, { enabled: canView });
  const query = useAttributeValues(attributeId, controls, {
    enabled: canView && parent.isSuccess,
  });

  const { mutate: updateValue, isPending: isUpdating } =
    useUpdateAttributeValue();
  const { mutate: deleteValue, isPending: isDeleting } =
    useDeleteAttributeValue();

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
            MESSAGES.PRODUCT_ATTRIBUTE_VALUES.LOAD_FAILED,
        );
      } else {
        toast.error(MESSAGES.PRODUCT_ATTRIBUTE_VALUES.LOAD_UNEXPECTED);
      }
    }
  }, [query.isError, query.error]);

  const handleOpenCreateModal = useCallback(() => {
    setSelectedValueForEdit(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((value: IAttributeValue) => {
    setSelectedValueForEdit(value);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenDeleteConfirm = useCallback((value: IAttributeValue) => {
    setDeletingValue(value);
    setIsConfirmDeleteOpen(true);
  }, []);

  const handleToggleStatus = useCallback(
    (value: IAttributeValue) => {
      if (!canView || !canUpdate || isPendingAction || statusTogglingId) return;

      const nextStatus =
        value.status === ProductAttributeStatus.ACTIVE
          ? ProductAttributeStatus.INACTIVE
          : ProductAttributeStatus.ACTIVE;

      setStatusTogglingId(value.id);
      updateValue(
        {
          attributeId,
          id: value.id,
          payload: {
            label: value.label,
            status: nextStatus,
          },
        },
        {
          onSuccess: (res) => {
            toast.success(
              res?.message ||
                (nextStatus === ProductAttributeStatus.ACTIVE
                  ? MESSAGES.PRODUCT_ATTRIBUTE_VALUES.STATUS_ACTIVATED
                  : MESSAGES.PRODUCT_ATTRIBUTE_VALUES.STATUS_DEACTIVATED),
            );
            setStatusTogglingId(null);
          },
          onError: (error) => {
            setStatusTogglingId(null);
            const message = axios.isAxiosError<IApiErrorResponse>(error)
              ? error.response?.data?.message ||
                MESSAGES.PRODUCT_ATTRIBUTE_VALUES.UPDATE_FAILED
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
    [
      canView,
      canUpdate,
      isPendingAction,
      statusTogglingId,
      attributeId,
      updateValue,
      query,
    ],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deletingValue || !canView || !canDelete || isPendingAction) return;

    deleteValue(
      { attributeId, id: deletingValue.id },
      {
        onSuccess: (res) => {
          toast.success(
            res?.message || MESSAGES.PRODUCT_ATTRIBUTE_VALUES.DELETE_SUCCESS,
          );
          setIsConfirmDeleteOpen(false);
          setDeletingValue(null);
        },
        onError: (error) => {
          const message = axios.isAxiosError<IApiErrorResponse>(error)
            ? error.response?.data?.message ||
              MESSAGES.PRODUCT_ATTRIBUTE_VALUES.DELETE_FAILED
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
            void parent.refetch();
          }
        },
      },
    );
  }, [
    deletingValue,
    canView,
    canDelete,
    isPendingAction,
    attributeId,
    deleteValue,
    query,
    parent,
  ]);

  const columns = useMemo<ColumnDef<IAttributeValue>[]>(() => {
    return [
      {
        accessorKey: "label",
        header: "Value Label",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 break-words">
              {row.original.label}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
          const valStatus = row.original.status;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                statusColors[valStatus] ||
                "bg-zinc-50 text-zinc-700 border-zinc-200"
              }`}
            >
              {valStatus === ProductAttributeStatus.ACTIVE
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
      ...(canUpdate || canDelete
        ? [
            {
              id: "actions",
              header: () => <div className="text-right">Actions</div>,
              enableSorting: false,
              cell: ({ row }: { row: { original: IAttributeValue } }) => {
                const valueItem = row.original;
                const isToggling = statusTogglingId === valueItem.id;

                return (
                  <div className="flex items-center justify-end gap-1.5">
                    {canUpdate && (
                      <>
                        <UIButton
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label="Edit value"
                          disabled={isPendingAction}
                          onClick={() => handleOpenEditModal(valueItem)}
                        >
                          <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
                        </UIButton>
                        <UIButton
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-medium"
                          disabled={isPendingAction || isToggling}
                          onClick={() => void handleToggleStatus(valueItem)}
                        >
                          {valueItem.status === ProductAttributeStatus.ACTIVE
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
                        aria-label="Delete value"
                        disabled={isPendingAction}
                        onClick={() => handleOpenDeleteConfirm(valueItem)}
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
    handleOpenDeleteConfirm,
    handleToggleStatus,
  ]);

  if (parent.isLoading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <UILoader />
        </div>
      </PageContainer>
    );
  }

  const parentErrorMessage = axios.isAxiosError<IApiErrorResponse>(parent.error)
    ? parent.error.response?.data?.message || MESSAGES.COMMON.UNEXPECTED_ERROR
    : MESSAGES.COMMON.UNEXPECTED_ERROR;

  if (parent.isError || !parent.data) {
    return (
      <PageContainer>
        <div className="mb-4">
          <Link
            href={PAGE_ROUTES.PRODUCT_ATTRIBUTES}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 px-2.5 py-1 rounded-lg transition-all duration-200 w-fit"
          >
            <ArrowLeft className="size-3.5 stroke-[2.5]" />
            Back to Attributes
          </Link>
        </div>
        <UIErrorState
          title="Attribute unavailable"
          description={parentErrorMessage}
          actionText="Try Again"
          onAction={() => {
            void parent.refetch();
          }}
        />
      </PageContainer>
    );
  }

  const queryErrorMessage = axios.isAxiosError<IApiErrorResponse>(query.error)
    ? query.error.response?.data?.message || MESSAGES.COMMON.UNEXPECTED_ERROR
    : MESSAGES.COMMON.UNEXPECTED_ERROR;

  return (
    <PageContainer>
      <div className="mb-2">
        <Link
          href={PAGE_ROUTES.PRODUCT_ATTRIBUTES}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 px-2.5 py-1 rounded-lg transition-all duration-200 w-fit"
        >
          <ArrowLeft className="size-3.5 stroke-[2.5]" />
          Back to Attributes
        </Link>
      </div>

      <PageHeader
        title={TITLES.PRODUCT_ATTRIBUTES.VALUES}
        description={`${parent.data.name} • ${
          parent.data.status === ProductAttributeStatus.ACTIVE
            ? "Active"
            : "Inactive"
        }`}
      >
        <div className="w-full sm:w-64">
          <UIInput
            aria-label="Search values"
            placeholder="Search values..."
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
              Add Value
            </UIButton>
          </>
        )}
      </PageHeader>

      {parent.data.status === ProductAttributeStatus.INACTIVE && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20 p-4 text-sm text-amber-900 dark:text-amber-200"
        >
          <Info className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p>{MESSAGES.PRODUCT_ATTRIBUTES.INACTIVE_PARENT}</p>
        </div>
      )}

      {query.isError ? (
        <UIErrorState
          title="Failed to load attribute values"
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
          entityName="values"
          emptyState={
            <div className="py-12 text-center text-sm text-muted-foreground">
              {controls.search || controls.status
                ? "No matching values found. Try adjusting your search or filters."
                : "No values found."}
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

              if (first && first.id === "createdAt") {
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
      <AttributeValueFormModal
        parent={parent.data}
        open={isFormModalOpen}
        onOpenChange={(open) => {
          setIsFormModalOpen(open);
          if (!open) setSelectedValueForEdit(null);
        }}
        value={selectedValueForEdit}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={(open) => {
          if (!isPendingAction) {
            setIsConfirmDeleteOpen(open);
            if (!open) setDeletingValue(null);
          }
        }}
        title="Delete Value"
        description={
          deletingValue
            ? `Permanently delete the value "${deletingValue.label}" from "${parent.data.name}"? This cannot be undone.`
            : "Are you sure you want to delete this value?"
        }
        confirmText="Delete Permanently"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}
