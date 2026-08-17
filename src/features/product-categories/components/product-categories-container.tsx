"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUpdateQueryParams } from "@/shared/hooks/use-update-query-params";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { CommonTable } from "@/components/common/CommonTable";
import { UIButton } from "@/components/common/UIButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { UIInput } from "@/components/common/UIInput/UIInput";
import { UISelect } from "@/components/common/UISelect/UISelect";
import { PageHeader, PageContainer } from "@/components/common";

import {
  useDeleteCategory,
  useCategories,
} from "../queries/product-categories.queries";
import {
  ProductCategoryStatus,
  type ICategory,
  type CategorySortField,
  type SortOrder,
} from "../types/product-categories.types";
import { CategoryFormModal } from "./category-form-modal";
import { usePermissions, Page, Permission } from "@/permissions";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
}

export function ProductCategoriesContainer() {
  const searchParams = useSearchParams();
  const updateQueryParams = useUpdateQueryParams();

  const { can } = usePermissions();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] =
    useState<ICategory | null>(null);

  const [deletingCategory, setDeletingCategory] = useState<ICategory | null>(
    null,
  );
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);
  const sortBy =
    (searchParams.get("sortBy") as CategorySortField) || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "DESC";
  const search = searchParams.get("search") || "";
  const status = (searchParams.get("status") as ProductCategoryStatus) || "";

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(search);
  }, [search]);

  // Debounce search query parameter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateQueryParams({ search: searchInput, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, search, updateQueryParams]);

  const { data, isLoading, isFetching, isError, error } = useCategories(
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

  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  useEffect(() => {
    if (isError) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            MESSAGES.PRODUCT_CATEGORIES.LOAD_FAILED,
        );
      } else {
        toast.error(MESSAGES.PRODUCT_CATEGORIES.LOAD_UNEXPECTED);
      }
    }
  }, [isError, error]);

  const handleOpenCreateModal = useCallback(() => {
    setSelectedCategoryForEdit(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((category: ICategory) => {
    setSelectedCategoryForEdit(category);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenDeleteConfirm = useCallback((category: ICategory) => {
    setDeletingCategory(category);
    setIsConfirmDeleteOpen(true);
  }, []);

  const handleConfirmDelete = () => {
    if (!deletingCategory) return;

    deleteCategory(deletingCategory.id, {
      onSuccess: () => {
        toast.success(MESSAGES.PRODUCT_CATEGORIES.DELETE_SUCCESS);
        setIsConfirmDeleteOpen(false);
        setDeletingCategory(null);
      },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          toast.error(
            err.response?.data?.message ||
              MESSAGES.PRODUCT_CATEGORIES.DELETE_FAILED,
          );
        } else {
          toast.error(MESSAGES.PRODUCT_CATEGORIES.DELETE_FAILED);
        }
      },
    });
  };

  const columns = useMemo<ColumnDef<ICategory>[]>(() => {
    const hasUpdatePermission = can(Page.ProductCategories, Permission.UPDATE);
    const hasDeletePermission = can(Page.ProductCategories, Permission.DELETE);

    return [
      {
        accessorKey: "name",
        header: "Category Name",
        cell: ({ row }) => (
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-[250px]">
            {row.original.description || "-"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const categoryStatus = row.original.status;
          const statusColors: Record<ProductCategoryStatus, string> = {
            [ProductCategoryStatus.ACTIVE]:
              "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
            [ProductCategoryStatus.INACTIVE]:
              "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
          };

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                statusColors[categoryStatus] ||
                "bg-zinc-50 text-zinc-700 border-zinc-200"
              }`}
            >
              {categoryStatus}
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
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(row.original.updatedAt)}
          </span>
        ),
      },
      ...(hasUpdatePermission || hasDeletePermission
        ? [
            {
              id: "actions",
              header: () => <div className="text-right">Actions</div>,
              enableSorting: false,
              cell: ({ row }: { row: { original: ICategory } }) => (
                <div className="flex items-center gap-1.5">
                  {hasUpdatePermission && (
                    <UIButton
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="Edit category"
                      onClick={() => handleOpenEditModal(row.original)}
                    >
                      <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
                    </UIButton>
                  )}
                  {hasDeletePermission && (
                    <UIButton
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label="Delete category"
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
  }, [can, handleOpenEditModal, handleOpenDeleteConfirm]);

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active", value: ProductCategoryStatus.ACTIVE },
    { label: "Inactive", value: ProductCategoryStatus.INACTIVE },
  ];

  return (
    <PageContainer>
      <PageHeader title={TITLES.PRODUCT_CATEGORIES.CATEGORY_MANAGEMENT}>
        <div className="w-full sm:w-64">
          <UIInput
            placeholder="Search by category name..."
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

        {can(Page.ProductCategories, Permission.CREATE) && (
          <>
            <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
            <UIButton
              leftIcon={<Plus className="size-4" />}
              onClick={handleOpenCreateModal}
              className="h-9"
            >
              Add New Category
            </UIButton>
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
                sortBy: first.id as CategorySortField,
                sortOrder: first.desc ? "DESC" : "ASC",
                page: 1,
              });
            }
          },
        }}
        emptyState={
          <div className="py-12 text-center text-sm text-muted-foreground">
            No categories found.
          </div>
        }
      />

      {/* Form Modal (Create / Edit) */}
      <CategoryFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        category={selectedCategoryForEdit}
      />

      {/* Confirmation Dialog for Deletes */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Delete Category"
        description={
          deletingCategory
            ? `Are you sure you want to delete the category '${deletingCategory.name}'? This action cannot be undone.`
            : "Are you sure you want to delete this category?"
        }
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}
