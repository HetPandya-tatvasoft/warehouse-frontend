import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";

import { getQueryClient } from "@/lib/query/get-query-client";
import { productCategoriesQueries } from "@/features/product-categories/queries/product-categories.queries";
import { ProductCategoriesContainer } from "@/features/product-categories/components/product-categories-container";
import { PermissionGuard, Page, Permission } from "@/permissions";

export default async function ProductCategoriesPage() {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") || "";

  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(
      productCategoriesQueries.tree(cookieHeader),
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
