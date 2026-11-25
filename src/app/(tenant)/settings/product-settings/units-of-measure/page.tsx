import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { getQueryClient } from "@/lib/query/get-query-client";
import { PermissionGuard, Page, Permission } from "@/permissions";
import { unitsOfMeasureQueries } from "@/features/units-of-measure/queries/units-of-measure.queries";
import type {
  UnitOfMeasureStatus,
  UnitOfMeasureSortField,
  SortOrder,
  IGetUnitsOfMeasureParams,
} from "@/features/units-of-measure/types/units-of-measure.types";
import { UnitsOfMeasureContainer } from "@/features/units-of-measure/components/units-of-measure-container";

interface UnitsOfMeasurePageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function UnitsOfMeasurePage({
  searchParams,
}: UnitsOfMeasurePageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const sortBy = (params.sortBy as UnitOfMeasureSortField) || "createdAt";
  const sortOrder = (params.sortOrder as SortOrder) || "DESC";
  const search = params.search?.trim() || undefined;
  const status = (params.status as UnitOfMeasureStatus) || undefined;

  const controls: IGetUnitsOfMeasureParams = {
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
      unitsOfMeasureQueries.list(controls, cookieHeader),
    );
  } catch {
    // Ignore prefetch error on server; client handles error and retry
  }

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <PermissionGuard page={Page.UnitsOfMeasure} permission={Permission.VIEW}>
        <UnitsOfMeasureContainer />
      </PermissionGuard>
    </HydrationBoundary>
  );
}
