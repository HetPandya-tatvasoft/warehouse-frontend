import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { getQueryClient } from "@/lib/query/get-query-client";
import { PermissionGuard, Page, Permission } from "@/permissions";
import { productAttributesQueries } from "@/features/product-attributes/queries/product-attributes.queries";
import type {
  ProductAttributeStatus,
  AttributeSortField,
  SortOrder,
  IGetAttributesParams,
} from "@/features/product-attributes/types/product-attributes.types";
import { ProductAttributesContainer } from "@/features/product-attributes/components/product-attributes-container";

interface AttributesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function AttributesPage({
  searchParams,
}: AttributesPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const sortBy = (params.sortBy as AttributeSortField) || "createdAt";
  const sortOrder = (params.sortOrder as SortOrder) || "DESC";
  const search = params.search?.trim() || undefined;
  const status = (params.status as ProductAttributeStatus) || undefined;

  const controls: IGetAttributesParams = {
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
