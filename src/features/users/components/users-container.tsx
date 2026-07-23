"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUpdateQueryParams } from "@/shared/hooks/use-update-query-params";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Pencil, Plus, Power } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { CommonTable } from "@/components/common/CommonTable";
import { UIButton } from "@/components/common/UIButton";
import { UIInput } from "@/components/common/UIInput/UIInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";

import { useToggleUserStatus, useUsers } from "../queries/users.queries";
import type { IUser, UserSortField, SortOrder } from "../types/users.types";

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
}

export function UsersContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const updateQueryParams = useUpdateQueryParams();

  const [statusUser, setStatusUser] = useState<IUser | null>(null);
  const [isConfirmStatusOpen, setIsConfirmStatusOpen] = useState(false);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);
  const sortBy = (searchParams.get("sortBy") as UserSortField) || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "DESC";
  const search = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(search);
  }, [search]);

  const { data, isLoading, isFetching, isError, error } = useUsers({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search: search || undefined,
  });

  const { mutate: toggleStatus, isPending: isToggling } = useToggleUserStatus();

  useEffect(() => {
    if (isError) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to fetch users");
      } else {
        toast.error("An unexpected error occurred while loading users");
      }
    }
  }, [isError, error]);

  // Debounced search query parameter update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateQueryParams({ search: searchInput, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, search, updateQueryParams]);

  const handleCreateUser = useCallback(() => {
    router.push("/users/create");
  }, [router]);

  const handleEditUser = useCallback(
    (user: IUser) => {
      router.push(`/users/edit/${user.id}`);
    },
    [router],
  );

  const handleOpenStatusConfirm = useCallback((user: IUser) => {
    setStatusUser(user);
    setIsConfirmStatusOpen(true);
  }, []);

  const handleConfirmStatusToggle = () => {
    if (!statusUser) return;

    const newStatus = !statusUser.isActive;
    toggleStatus(
      { id: statusUser.id, payload: { isActive: newStatus } },
      {
        onSuccess: () => {
          toast.success(
            `User account ${newStatus ? "activated" : "deactivated"} successfully`,
          );
          setIsConfirmStatusOpen(false);
          setStatusUser(null);
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            toast.error(
              error.response?.data?.message || "Failed to update user status",
            );
          } else {
            toast.error("Something went wrong, please try again");
          }
        },
      },
    );
  };

  const columns = useMemo<ColumnDef<IUser>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {row.original.firstName} {row.original.lastName}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-zinc-600 dark:text-zinc-300 font-mono text-xs">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "roles",
        header: "Roles",
        enableSorting: false,
        cell: ({ row }) => {
          const roles = row.original.roles || [];
          if (roles.length === 0) {
            return (
              <span className="text-xs text-zinc-400 italic">No roles</span>
            );
          }
          return (
            <div className="flex flex-wrap gap-1">
              {roles.map((role) => (
                <span
                  key={role.id}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  {role.name}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created Date",
        cell: ({ row }) => (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <UIButton
                variant="ghost"
                size="sm"
                onClick={() => handleEditUser(user)}
                title="Edit User"
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
              </UIButton>

              <UIButton
                variant="ghost"
                size="sm"
                onClick={() => handleOpenStatusConfirm(user)}
                title={user.isActive ? "Deactivate User" : "Activate User"}
                className={`h-8 w-8 p-0 ${
                  user.isActive
                    ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                }`}
              >
                <Power className="h-4 w-4" />
              </UIButton>
            </div>
          );
        },
      },
    ],
    [handleEditUser, handleOpenStatusConfirm],
  );

  return (
    <div className="space-y-4">
      {/* Redesigned minimal header with inline controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            User Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <UIInput
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 py-1"
            />
          </div>

          {/* Space for future Role/Status filters */}
          <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-800" />

          <UIButton
            onClick={handleCreateUser}
            className="flex items-center gap-2 h-9 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </UIButton>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
        <CommonTable
          data={data?.items ?? []}
          columns={columns}
          isLoading={isLoading || isFetching}
          skeletonRowsCount={pageSize}
          pageSizeOptions={[5, 10, 20]}
          entityName="users"
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
                  sortBy: first.id as UserSortField,
                  sortOrder: first.desc ? "DESC" : "ASC",
                  page: 1,
                });
              }
            },
          }}
          emptyState={
            <div className="py-12 text-center text-sm text-muted-foreground">
              No users found.
            </div>
          }
        />
      </div>

      {/* Status Toggle Confirmation Modal */}
      <ConfirmDialog
        open={isConfirmStatusOpen}
        onOpenChange={setIsConfirmStatusOpen}
        title={
          statusUser?.isActive
            ? "Deactivate User Account"
            : "Activate User Account"
        }
        description={
          statusUser?.isActive
            ? `Are you sure you want to deactivate ${statusUser.firstName} ${statusUser.lastName}? They will be unable to log in to the portal.`
            : `Are you sure you want to activate ${statusUser?.firstName} ${statusUser?.lastName}? Their account access will be restored.`
        }
        confirmText={statusUser?.isActive ? "Deactivate" : "Activate"}
        confirmVariant={statusUser?.isActive ? "destructive" : "default"}
        onConfirm={handleConfirmStatusToggle}
        isLoading={isToggling}
      />
    </div>
  );
}
