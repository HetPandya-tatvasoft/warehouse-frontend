import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";

import { getQueryClient } from "@/lib/query/get-query-client";
import { rolesQueries } from "@/features/roles/queries/roles.queries";
import { RolesContainer } from "@/features/roles/components/roles-container";
import type { RoleSortField, SortOrder } from "@/features/roles/types/roles.types";

interface RolesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const sortBy = (params.sortBy as RoleSortField) || "createdAt";
  const sortOrder = (params.sortOrder as SortOrder) || "DESC";

  const queryParams = { page, pageSize, sortBy, sortOrder };

  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") || "";

  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(rolesQueries.list(queryParams, cookieHeader));
  } catch {
    // Ignore prefetch error on server; client will handle retry/toast if needed
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="w-full space-y-6">
        <RolesContainer />
      </div>
    </HydrationBoundary>
  );
}
