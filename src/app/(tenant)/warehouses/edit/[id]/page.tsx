"use client";

import { useWarehouse } from "@/features/warehouses/queries/warehouses.queries";
import { WarehouseDetails } from "@/features/warehouses/components/warehouse-details";
import { useParams, useRouter } from "next/navigation";
import { PermissionGuard, Page, Permission } from "@/permissions";
import { UILoader, UIErrorState } from "@/components/common";

export default function EditWarehousePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data, isLoading, isError } = useWarehouse(id);

  if (isLoading) {
    return (
      <PermissionGuard page={Page.Warehouses} permission={Permission.UPDATE}>
        <div className="w-full max-w-5xl mx-auto py-8">
          <UILoader />
        </div>
      </PermissionGuard>
    );
  }

  if (isError) {
    return (
      <PermissionGuard page={Page.Warehouses} permission={Permission.UPDATE}>
        <div className="w-full max-w-5xl mx-auto py-8">
          <UIErrorState
            title="Error Loading Warehouse"
            description="We couldn't retrieve the details for this warehouse."
            actionText="Back to Warehouses"
            onAction={() => router.push("/warehouses")}
            className="min-h-[300px]"
          />
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard page={Page.Warehouses} permission={Permission.UPDATE}>
      <div className="w-full max-w-5xl mx-auto py-4">
        {data && <WarehouseDetails warehouse={data} />}
      </div>
    </PermissionGuard>
  );
}
