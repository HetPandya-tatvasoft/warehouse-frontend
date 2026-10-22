import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { getQueryClient } from "@/lib/query/get-query-client";
import { PermissionGuard, Page, Permission } from "@/permissions";
import { brandQueries } from "@/features/brands/queries/brands.queries";
import type {
  BrandStatus,
  BrandSortField,
  SortOrder,
  IGetBrandsParams,
} from "@/features/brands/types/brands.types";
import { BrandsContainer } from "@/features/brands/components/brands-container";

interface BrandsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function BrandsPage({
  searchParams,
}: BrandsPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const sortBy = (params.sortBy as BrandSortField) || "createdAt";
  const sortOrder = (params.sortOrder as SortOrder) || "DESC";
  const search = params.search?.trim() || undefined;
  const status = (params.status as BrandStatus) || undefined;

  const controls: IGetBrandsParams = {
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    status,
  };

  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") ?? "";
  const client = getQueryClient();

  try {
    await client.prefetchQuery(brandQueries.list(controls, cookieHeader));
  } catch {
    // Ignore prefetch error on server; client handles error and retry
  }

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <PermissionGuard page={Page.Brands} permission={Permission.VIEW}>
        <BrandsContainer />
      </PermissionGuard>
    </HydrationBoundary>
  );
}
