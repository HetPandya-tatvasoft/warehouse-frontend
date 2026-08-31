"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUpdateQueryParams } from "@/shared/hooks/use-update-query-params";
import { useSyncedState } from "@/shared/hooks/use-synced-state";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, PauseCircle, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";
import { CommonTable } from "@/components/common/CommonTable";
import { UIButton } from "@/components/common/UIButton";
import { UIInput } from "@/components/common/UIInput/UIInput";
import { UISelect } from "@/components/common/UISelect/UISelect";
import { PageHeader, PageContainer } from "@/components/common";
import { useTenants } from "../queries/tenants.queries";
import type {
  ITenant,
  TenantSortField,
  SortOrder,
} from "../types/tenants.types";

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
}

export function TenantList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateQueryParams = useUpdateQueryParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);
  const sortBy = (searchParams.get("sortBy") as TenantSortField) || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "DESC";
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const [searchInput, setSearchInput] = useSyncedState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateQueryParams({ search: searchInput, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, search, updateQueryParams]);

  const { data, isLoading, isFetching, isError, error } = useTenants({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search: search || undefined,
    status: status || undefined,
  });

  useEffect(() => {
    if (isError) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || MESSAGES.TENANTS.LOAD_FAILED,
        );
      } else {
        toast.error(MESSAGES.TENANTS.LOAD_UNEXPECTED);
      }
    }
  }, [isError, error]);

  const columns = useMemo<ColumnDef<ITenant>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Company Name",
        cell: ({ row }) => (
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {row.original.name}
          </span>
        ),
      },
      {
        id: "primaryAdmin",
        header: "Primary Administrator",
        cell: ({ row }) => {
          const admin = row.original.primaryAdmin;
          if (!admin) {
            return (
              <span className="text-zinc-400 italic text-xs">
                No admin info
              </span>
            );
          }
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                {admin.firstName} {admin.lastName}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {admin.email}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "companyEmail",
        header: "Company Email",
        cell: ({ row }) => (
          <span className="text-zinc-600 dark:text-zinc-300 font-mono text-xs">
            {row.original.companyEmail}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const tenantStatus = row.original.status;
          const statusColors: Record<string, string> = {
            ACTIVE:
              "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
            SUSPENDED:
              "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
            PENDING:
              "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
          };
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                statusColors[tenantStatus] ||
                "bg-zinc-50 text-zinc-700 border-zinc-200"
              }`}
            >
              {tenantStatus}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
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
        cell: () => (
          <div className="flex items-center gap-1.5">
            <UIButton
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="View"
            >
              <Eye className="h-4 w-4 text-zinc-500" />
            </UIButton>
            <UIButton
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Edit"
            >
              <Pencil className="h-4 w-4 text-zinc-500" />
            </UIButton>
            <UIButton
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              title="Suspend"
            >
              <PauseCircle className="h-4 w-4 text-rose-500" />
            </UIButton>
          </div>
        ),
      },
    ],
    [],
  );

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active", value: "ACTIVE" },
    { label: "Suspended", value: "SUSPENDED" },
    { label: "Pending", value: "PENDING" },
  ];

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title={TITLES.TENANTS.PLATFORM_TENANT_MANAGEMENT}
        description="Display, search, and onboard system tenants."
      >
        <UIButton
          onClick={() => router.push(PAGE_ROUTES.PLATFORM_TENANTS_CREATE)}
          className="flex items-center gap-2 h-9 text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Tenant</span>
        </UIButton>
      </PageHeader>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-72 relative">
          <UIInput
            placeholder="Search by company name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="w-full sm:w-auto shrink-0">
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
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
        <CommonTable
          data={data?.items ?? []}
          columns={columns}
          isLoading={isLoading || isFetching}
          skeletonRowsCount={pageSize}
          pageSizeOptions={[5, 10, 20]}
          entityName="tenants"
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
                  sortBy: first.id as TenantSortField,
                  sortOrder: first.desc ? "DESC" : "ASC",
                  page: 1,
                });
              }
            },
          }}
          emptyState={
            <div className="py-12 text-center text-sm text-muted-foreground">
              No tenants found.
            </div>
          }
        />
      </div>
    </PageContainer>
  );
}
