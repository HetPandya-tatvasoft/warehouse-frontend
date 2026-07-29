import { RolePermissionsForm } from "@/features/roles/components/role-permissions-form";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <div className="w-full">
      <RolePermissionsForm roleId={resolvedParams.id} />
    </div>
  );
}
