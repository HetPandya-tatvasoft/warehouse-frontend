import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";

import { getQueryClient } from "@/lib/query/get-query-client";
import { productCategoriesQueries } from "@/features/product-categories/queries/product-categories.queries";
import { ProductCategoriesContainer } from "@/features/product-categories/components/product-categories-container";
import type {
  ProductCategoryStatus,
  CategorySortField,
  SortOrder,
} from "@/features/product-categories/types/product-categories.types";
import { PermissionGuard, Page, Permission } from "@/permissions";

interface ProductCategoriesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function ProductCategoriesPage({
  searchParams,
}: ProductCategoriesPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const sortBy = (params.sortBy as CategorySortField) || "createdAt";
  const sortOrder = (params.sortOrder as SortOrder) || "DESC";
  const search = params.search || undefined;
  const status = (params.status as ProductCategoryStatus) || undefined;

  const queryParams = { page, pageSize, sortBy, sortOrder, search, status };

  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") || "";

  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(
      productCategoriesQueries.list(queryParams, cookieHeader),
    );
  } catch {
    // Ignore prefetch error on server; client handles retry/toast if needed
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PermissionGuard page={Page.ProductCategories} permission={Permission.VIEW}>
        <div className="w-full space-y-6">
          <ProductCategoriesContainer />
        </div>
      </PermissionGuard>
    </HydrationBoundary>
  );
}
