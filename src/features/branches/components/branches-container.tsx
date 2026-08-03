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

import { useDeleteBranch, useBranches } from "../queries/branches.queries";
import {
  BranchStatus,
  type IBranch,
  type BranchSortField,
  type SortOrder,
} from "../types/branches.types";
import { BranchFormModal } from "./branch-form-modal";
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

export function BranchesContainer() {
  const searchParams = useSearchParams();
  const updateQueryParams = useUpdateQueryParams();

  const { can } = usePermissions();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedBranchForEdit, setSelectedBranchForEdit] =
    useState<IBranch | null>(null);

  const [deletingBranch, setDeletingBranch] = useState<IBranch | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);
  const sortBy = (searchParams.get("sortBy") as BranchSortField) || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "DESC";
  const search = searchParams.get("search") || "";
  const status = (searchParams.get("status") as BranchStatus) || "";

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

  const { data, isLoading, isFetching, isError, error } = useBranches(
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

  const { mutate: deleteBranch, isPending: isDeleting } = useDeleteBranch();

  useEffect(() => {
    if (isError) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || MESSAGES.BRANCHES.LOAD_FAILED,
        );
      } else {
        toast.error(MESSAGES.BRANCHES.LOAD_UNEXPECTED);
      }
    }
  }, [isError, error]);

  const handleOpenCreateModal = useCallback(() => {
    setSelectedBranchForEdit(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((branch: IBranch) => {
    setSelectedBranchForEdit(branch);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenDeleteConfirm = useCallback((branch: IBranch) => {
    setDeletingBranch(branch);
    setIsConfirmDeleteOpen(true);
  }, []);

  const handleConfirmDelete = () => {
    if (!deletingBranch) return;

    deleteBranch(deletingBranch.id, {
      onSuccess: () => {
        toast.success(MESSAGES.BRANCHES.DELETE_SUCCESS);
        setIsConfirmDeleteOpen(false);
        setDeletingBranch(null);
      },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          toast.error(
            err.response?.data?.message || MESSAGES.BRANCHES.DELETE_FAILED,
          );
        } else {
          toast.error(MESSAGES.BRANCHES.DELETE_FAILED);
        }
      },
    });
  };

  const columns = useMemo<ColumnDef<IBranch>[]>(() => {
    const hasUpdatePermission = can(Page.Branches, Permission.UPDATE);
    const hasDeletePermission = can(Page.Branches, Permission.DELETE);

    return [
      {
        accessorKey: "name",
        header: "Branch Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {row.original.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const branchStatus = row.original.status;
          const statusColors: Record<BranchStatus, string> = {
            [BranchStatus.ACTIVE]:
              "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
            [BranchStatus.INACTIVE]:
              "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
          };

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                statusColors[branchStatus] ||
                "bg-zinc-50 text-zinc-700 border-zinc-200"
              }`}
            >
              {branchStatus}
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
              cell: ({ row }: { row: { original: IBranch } }) => (
                <div className="flex items-center gap-1.5">
                  {hasUpdatePermission && (
                    <UIButton
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="Edit branch"
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
                      aria-label="Delete branch"
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
    { label: "Active", value: BranchStatus.ACTIVE },
    { label: "Inactive", value: BranchStatus.INACTIVE },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {TITLES.BRANCHES.BRANCH_MANAGEMENT}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-64">
            <UIInput
              placeholder="Search by branch name..."
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

          {can(Page.Branches, Permission.CREATE) && (
            <>
              <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
              <UIButton
                leftIcon={<Plus className="size-4" />}
                onClick={handleOpenCreateModal}
                className="h-9"
              >
                Add New Branch
              </UIButton>
            </>
          )}
        </div>
      </div>

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
                sortBy: first.id as BranchSortField,
                sortOrder: first.desc ? "DESC" : "ASC",
                page: 1,
              });
            }
          },
        }}
        emptyState={
          <div className="py-12 text-center text-sm text-muted-foreground">
            No branches found.
          </div>
        }
      />

      {/* Form Modal (Create / Edit) */}
      <BranchFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        branch={selectedBranchForEdit}
      />

      {/* Confirmation Dialog for Deletes */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Delete Branch"
        description={
          deletingBranch
            ? `Are you sure you want to delete the branch '${deletingBranch.name}'? This action cannot be undone.`
            : "Are you sure you want to delete this branch?"
        }
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
