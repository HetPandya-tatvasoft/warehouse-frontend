import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";

import { getQueryClient } from "@/lib/query/get-query-client";
import { branchesQueries } from "@/features/branches/queries/branches.queries";
import { BranchesContainer } from "@/features/branches/components/branches-container";
import type {
  BranchStatus,
  BranchSortField,
  SortOrder,
} from "@/features/branches/types/branches.types";
import { PermissionGuard, Page, Permission } from "@/permissions";

interface BranchesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function BranchesPage({
  searchParams,
}: BranchesPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const sortBy = (params.sortBy as BranchSortField) || "createdAt";
  const sortOrder = (params.sortOrder as SortOrder) || "DESC";
  const search = params.search || undefined;
  const status = (params.status as BranchStatus) || undefined;

  const queryParams = { page, pageSize, sortBy, sortOrder, search, status };

  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") || "";

  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(
      branchesQueries.list(queryParams, cookieHeader),
    );
  } catch {
    // Ignore prefetch error on server; client handles retry/toast if needed
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PermissionGuard page={Page.Branches} permission={Permission.VIEW}>
        <div className="w-full space-y-6">
          <BranchesContainer />
        </div>
      </PermissionGuard>
    </HydrationBoundary>
  );
}
