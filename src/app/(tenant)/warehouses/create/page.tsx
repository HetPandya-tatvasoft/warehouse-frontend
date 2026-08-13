import { WarehouseForm } from "@/features/warehouses/components/warehouse-form";
import { PermissionGuard, Page, Permission } from "@/permissions";

export default function CreateWarehousePage() {
  return (
    <PermissionGuard page={Page.Warehouses} permission={Permission.CREATE}>
      <div className="w-full max-w-5xl mx-auto py-4">
        <WarehouseForm />
      </div>
    </PermissionGuard>
  );
}
