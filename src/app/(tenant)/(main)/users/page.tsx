import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";

import { getQueryClient } from "@/lib/query/get-query-client";
import { usersQueries } from "@/features/users/queries/users.queries";
import { UsersContainer } from "@/features/users/components/users-container";
import type { UserSortField, SortOrder } from "@/features/users/types/users.types";
import { PermissionGuard, Page, Permission } from "@/permissions";

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const sortBy = (params.sortBy as UserSortField) || "createdAt";
  const sortOrder = (params.sortOrder as SortOrder) || "DESC";
  const search = params.search || undefined;

  const queryParams = { page, pageSize, sortBy, sortOrder, search };

  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") || "";

  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(usersQueries.list(queryParams, cookieHeader));
  } catch {
    // Ignore prefetch error on server; client handles retry/toast if needed
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PermissionGuard page={Page.Users} permission={Permission.VIEW}>
        <div className="w-full space-y-6">
          <UsersContainer />
        </div>
      </PermissionGuard>
    </HydrationBoundary>
  );
}
