import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";

import { getQueryClient } from "@/lib/query/get-query-client";
import { warehousesQueries } from "@/features/warehouses/queries/warehouses.queries";
import { WarehousesContainer } from "@/features/warehouses/components/warehouses-container";
import type {
  WarehouseStatus,
  WarehouseSortField,
  SortOrder,
} from "@/features/warehouses/types/warehouses.types";
import { PermissionGuard, Page, Permission } from "@/permissions";

interface WarehousesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function WarehousesPage({
  searchParams,
}: WarehousesPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const sortBy = (params.sortBy as WarehouseSortField) || "createdAt";
  const sortOrder = (params.sortOrder as SortOrder) || "DESC";
  const search = params.search || undefined;
  const status = (params.status as WarehouseStatus) || undefined;

  const queryParams = {
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    status,
  };

  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") || "";

  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(
      warehousesQueries.list(queryParams, cookieHeader),
    );
  } catch {
    // Ignore prefetch error on server; client handles retry/toast if needed
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PermissionGuard page={Page.Warehouses} permission={Permission.VIEW}>
        <div className="w-full space-y-6">
          <WarehousesContainer />
        </div>
      </PermissionGuard>
    </HydrationBoundary>
  );
}
