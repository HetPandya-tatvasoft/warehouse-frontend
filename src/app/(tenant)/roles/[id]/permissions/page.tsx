import { RolePermissionsForm } from "@/features/roles/components/role-permissions-form";
import { PermissionGuard, Page, Permission } from "@/permissions";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RolePermissionsPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <PermissionGuard page={Page.Roles} permission={Permission.UPDATE}>
      <div className="w-full">
        <RolePermissionsForm roleId={resolvedParams.id} />
      </div>
    </PermissionGuard>
  );
}
