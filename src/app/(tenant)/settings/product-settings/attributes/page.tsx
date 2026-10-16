import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { getQueryClient } from "@/lib/query/get-query-client";
import { PermissionGuard, Page, Permission } from "@/permissions";
import { productAttributesQueries } from "@/features/product-attributes/queries/product-attributes.queries";
import {
  ProductAttributeStatus,
  type IGetAttributesParams,
} from "@/features/product-attributes/types/product-attributes.types";
import { ProductAttributesContainer } from "@/features/product-attributes/components/product-attributes-container";

interface AttributesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AttributesPage({
  searchParams,
}: AttributesPageProps) {
  const search = await searchParams;

  // Match URLSearchParams.get: use the first value when a parameter is repeated.
  const params = {
    page: Array.isArray(search.page) ? search.page[0] : search.page,
    pageSize: Array.isArray(search.pageSize)
      ? search.pageSize[0]
      : search.pageSize,
    sortBy: Array.isArray(search.sortBy) ? search.sortBy[0] : search.sortBy,
    sortOrder: Array.isArray(search.sortOrder)
      ? search.sortOrder[0]
      : search.sortOrder,
    search: Array.isArray(search.search) ? search.search[0] : search.search,
    status: Array.isArray(search.status) ? search.status[0] : search.status,
  };

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const controls: IGetAttributesParams = {
    page,
    pageSize,
    sortBy: params.sortBy === "name" ? "name" : "createdAt",
    sortOrder: params.sortOrder === "ASC" ? "ASC" : "DESC",
    search: params.search?.trim() || undefined,
    status:
      params.status === ProductAttributeStatus.ACTIVE ||
      params.status === ProductAttributeStatus.INACTIVE
        ? params.status
        : undefined,
  };

  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") ?? "";
  const client = getQueryClient();

  try {
    await client.prefetchQuery(
      productAttributesQueries.list(controls, cookieHeader),
    );
  } catch {
    // Ignore prefetch error on server; client handles error and retry
  }

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <PermissionGuard
        page={Page.ProductAttributes}
        permission={Permission.VIEW}
      >
        <ProductAttributesContainer />
      </PermissionGuard>
    </HydrationBoundary>
  );
}
