import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { getQueryClient } from "@/lib/query/get-query-client";
import { PermissionGuard, Page, Permission } from "@/permissions";
import { productAttributesQueries } from "@/features/product-attributes/queries/product-attributes.queries";
import {
  ProductAttributeStatus,
  type IGetAttributeValuesParams,
} from "@/features/product-attributes/types/product-attributes.types";
import { AttributeValuesContainer } from "@/features/product-attributes/components/attribute-values-container";

interface AttributeValuesPageProps {
  params: Promise<{ attributeId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AttributeValuesPage({
  params,
  searchParams,
}: AttributeValuesPageProps) {
  const { attributeId } = await params;
  const query = await searchParams;

  // Match URLSearchParams.get: use the first value when a parameter is repeated.
  const search = {
    page: Array.isArray(query.page) ? query.page[0] : query.page,
    pageSize: Array.isArray(query.pageSize)
      ? query.pageSize[0]
      : query.pageSize,
    sortOrder: Array.isArray(query.sortOrder)
      ? query.sortOrder[0]
      : query.sortOrder,
    search: Array.isArray(query.search) ? query.search[0] : query.search,
    status: Array.isArray(query.status) ? query.status[0] : query.status,
  };

  const page = Math.max(1, Number(search.page) || 1);
  const pageSize = Math.max(1, Number(search.pageSize) || 10);
  const controls: IGetAttributeValuesParams = {
    page,
    pageSize,
    sortBy: "createdAt",
    sortOrder: search.sortOrder === "ASC" ? "ASC" : "DESC",
    search: search.search?.trim() || undefined,
    status:
      search.status === ProductAttributeStatus.ACTIVE ||
      search.status === ProductAttributeStatus.INACTIVE
        ? search.status
        : undefined,
  };

  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") ?? "";
  const client = getQueryClient();

  try {
    await client.fetchQuery(
      productAttributesQueries.detail(attributeId, cookieHeader),
    );
    await client.prefetchQuery(
      productAttributesQueries.values(attributeId, controls, cookieHeader),
    );
  } catch {
    // The guarded client handles parent errors; do not prefetch values for an unavailable parent.
  }

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <PermissionGuard
        page={Page.ProductAttributes}
        permission={Permission.VIEW}
      >
        <AttributeValuesContainer key={attributeId} attributeId={attributeId} />
      </PermissionGuard>
    </HydrationBoundary>
  );
}
