"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUpdateQueryParams } from "@/shared/hooks/use-update-query-params";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Key, Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { CommonTable } from "@/components/common/CommonTable";
import { UIButton } from "@/components/common/UIButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { UIInput } from "@/components/common/UIInput/UIInput";

import { useDeleteRole, useRoles } from "../queries/roles.queries";
import type { IRole, RoleSortField, SortOrder } from "../types/roles.types";
import { RoleFormModal } from "./role-form-modal";
import { usePermissions, Page, Permission } from "@/permissions";
import { MESSAGES } from "@/shared/constants/messages";

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
}

export function RolesContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const updateQueryParams = useUpdateQueryParams();

  const { can } = usePermissions();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<IRole | null>(
    null,
  );

  const [deletingRole, setDeletingRole] = useState<IRole | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);
  const sortBy = (searchParams.get("sortBy") as RoleSortField) || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "DESC";
  const search = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(search);
  }, [search]);

  // Common hook for debouncing  and searching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateQueryParams({ search: searchInput, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, search, updateQueryParams]);

  const { data, isLoading, isFetching, isError, error } = useRoles(
    {
      page,
      pageSize,
      sortBy,
      sortOrder,
      search: search || undefined,
    },
    {
      enabled: true,
    },
  );

  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

  useEffect(() => {
    if (isError) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || MESSAGES.ROLES.LOAD_FAILED,
        );
      } else {
        toast.error(MESSAGES.ROLES.LOAD_UNEXPECTED);
      }
    }
  }, [isError, error]);

  const handleOpenCreateModal = useCallback(() => {
    setSelectedRoleForEdit(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((role: IRole) => {
    setSelectedRoleForEdit(role);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenDeleteConfirm = useCallback((role: IRole) => {
    setDeletingRole(role);
    setIsConfirmDeleteOpen(true);
  }, []);

  const handleConfirmDelete = () => {
    if (!deletingRole) return;

    deleteRole(deletingRole.id, {
      onSuccess: () => {
        toast.success(`Role '${deletingRole.name}' deleted successfully`);
        setIsConfirmDeleteOpen(false);
        setDeletingRole(null);
      },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          toast.error(
            err.response?.data?.message || MESSAGES.ROLES.DELETE_FAILED,
          );
        } else {
          toast.error(MESSAGES.ROLES.DELETE_FAILED_UNEXPECTED);
        }
      },
    });
  };

  const handleManagePermissions = useCallback(
    (roleId: string) => {
      router.push(`/roles/${roleId}/permissions`);
    },
    [router],
  );

  const columns = useMemo<ColumnDef<IRole>[]>(() => {
    const hasUpdatePermission = can(Page.Roles, Permission.UPDATE);
    const hasDeletePermission = can(Page.Roles, Permission.DELETE);

    return [
      {
        accessorKey: "name",
        header: "Role Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Shield className="size-4" />
            </div>
            <span className="font-medium text-foreground">
              {row.original.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.description || "-"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
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
              cell: ({ row }: { row: { original: IRole } }) => (
                <div className="flex items-center gap-1">
                  {hasUpdatePermission && (
                    <>
                      <UIButton
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label="Manage permissions"
                        onClick={() => handleManagePermissions(row.original.id)}
                      >
                        <Key className="size-4 text-muted-foreground hover:text-foreground" />
                      </UIButton>
                      <UIButton
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label="Edit role"
                        onClick={() => handleOpenEditModal(row.original)}
                      >
                        <Pencil className="size-4 text-muted-foreground hover:text-foreground" />
                      </UIButton>
                    </>
                  )}
                  {hasDeletePermission && (
                    <UIButton
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label="Delete role"
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
  }, [
    handleManagePermissions,
    can,
    handleOpenEditModal,
    handleOpenDeleteConfirm,
  ]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Roles Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage system roles, tenant scope, and access control rights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <UIInput
              placeholder="Search by role name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 py-1"
            />
          </div>

          <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-800" />

          {can(Page.Roles, Permission.CREATE) && (
            <UIButton
              leftIcon={<Plus className="size-4" />}
              onClick={handleOpenCreateModal}
              className="h-9"
            >
              Add New Role
            </UIButton>
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
                sortBy: first.id as RoleSortField,
                sortOrder: first.desc ? "DESC" : "ASC",
                page: 1,
              });
            }
          },
        }}
        emptyState={
          <div className="py-12 text-center text-sm text-muted-foreground">
            No roles found.
          </div>
        }
      />

      {/* Role Form Modal (Create / Edit) */}
      <RoleFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        role={selectedRoleForEdit}
      />

      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Delete Role"
        description={
          deletingRole
            ? `Are you sure you want to delete the role '${deletingRole.name}'? This action cannot be undone.`
            : "Are you sure you want to delete this role?"
        }
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
