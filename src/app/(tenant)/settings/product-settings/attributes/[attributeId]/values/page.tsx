import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { getQueryClient } from "@/lib/query/get-query-client";
import { PermissionGuard, Page, Permission } from "@/permissions";
import { productAttributesQueries } from "@/features/product-attributes/queries/product-attributes.queries";
import type {
  ProductAttributeStatus,
  AttributeValueSortField,
  SortOrder,
  IGetAttributeValuesParams,
} from "@/features/product-attributes/types/product-attributes.types";
import { AttributeValuesContainer } from "@/features/product-attributes/components/attribute-values-container";

interface AttributeValuesPageProps {
  params: Promise<{ attributeId: string }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function AttributeValuesPage({
  params,
  searchParams,
}: AttributeValuesPageProps) {
  const { attributeId } = await params;
  const query = await searchParams;

  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.max(1, Number(query.pageSize) || 10);
  const sortBy = (query.sortBy as AttributeValueSortField) || "createdAt";
  const sortOrder = (query.sortOrder as SortOrder) || "DESC";
  const search = query.search?.trim() || undefined;
  const status = (query.status as ProductAttributeStatus) || undefined;

  const controls: IGetAttributeValuesParams = {
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
