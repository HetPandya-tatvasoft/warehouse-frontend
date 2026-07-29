"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUpdateQueryParams } from "@/shared/hooks/use-update-query-params";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Pencil, Plus, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { CommonTable } from "@/components/common/CommonTable";
import { UIButton } from "@/components/common/UIButton";
import { UIInput } from "@/components/common/UIInput/UIInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";

import { useToggleUserStatus, useUsers } from "../queries/users.queries";
import { useCurrentUser } from "@/features/auth/queries/auth.queries";
import type { IUser, UserSortField, SortOrder } from "../types/users.types";
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

export function UsersContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const updateQueryParams = useUpdateQueryParams();

  const { can } = usePermissions();
  const { data: currentUser } = useCurrentUser();

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

  const { data, isLoading, isFetching, isError, error } = useUsers(
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

  const { mutate: toggleStatus, isPending: isToggling } = useToggleUserStatus();

  useEffect(() => {
    if (isError) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || MESSAGES.USERS.LOAD_FAILED);
      } else {
        toast.error(MESSAGES.USERS.LOAD_UNEXPECTED);
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
            newStatus
              ? MESSAGES.USERS.STATUS_ACTIVATED
              : MESSAGES.USERS.STATUS_DEACTIVATED,
          );
          setIsConfirmStatusOpen(false);
          setStatusUser(null);
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            toast.error(
              error.response?.data?.message || MESSAGES.USERS.STATUS_UPDATE_FAILED,
            );
          } else {
            toast.error(MESSAGES.COMMON.SOMETHING_WENT_WRONG);
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
        cell: ({ row }) => {
          const user = row.original;
          const isSelf = currentUser && user.id === currentUser.id;
          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {user.firstName} {user.lastName}
              </span>
              {isSelf && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  You
                </span>
              )}
            </div>
          );
        },
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
      ...(can(Page.Users, Permission.UPDATE) || currentUser
        ? [
            {
              id: "actions",
              header: "Actions",
              enableSorting: false,
              cell: ({ row }: { row: { original: IUser } }) => {
                const user = row.original;
                const isSelf = currentUser && user.id === currentUser.id;
                const hasUpdatePermission = can(Page.Users, Permission.UPDATE);

                return (
                  <div className="flex items-center gap-1.5">
                    {hasUpdatePermission && (
                      <>
                        <UIButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title={TITLES.USERS.EDIT_USER}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                        </UIButton>

                        <UIButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenStatusConfirm(user)}
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "You cannot deactivate your own account"
                              : user.isActive
                                ? "Deactivate User"
                                : "Activate User"
                          }
                          className={`h-8 w-8 p-0 ${
                            isSelf
                              ? "opacity-50 cursor-not-allowed text-zinc-400"
                              : user.isActive
                                ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          }`}
                        >
                          {user.isActive ? (
                            <Trash2 className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </UIButton>
                      </>
                    )}
                  </div>
                );
              },
            },
          ]
        : []),
    ],
    [can, handleEditUser, handleOpenStatusConfirm, currentUser],
  );

  return (
    <div className="space-y-4">
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

          <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-800" />

          {can(Page.Users, Permission.CREATE) && (
            <UIButton
              onClick={handleCreateUser}
              className="flex items-center gap-2 h-9 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </UIButton>
          )}
        </div>
      </div>

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
