"use client";

import { useUser } from "@/features/users/queries/users.queries";
import { UserForm } from "@/features/users/components/user-form";
import { useParams, useRouter } from "next/navigation";
import { PermissionGuard, Page, Permission } from "@/permissions";
import { UILoader, UIErrorState } from "@/components/common";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data, isLoading, isError } = useUser(id);

  if (isLoading) {
    return (
      <PermissionGuard page={Page.Users} permission={Permission.UPDATE}>
        <div className="w-full space-y-6 max-w-4xl mx-auto py-6">
          <UILoader />
        </div>
      </PermissionGuard>
    );
  }

  if (isError) {
    return (
      <PermissionGuard page={Page.Users} permission={Permission.UPDATE}>
        <div className="w-full space-y-6 max-w-4xl mx-auto py-6">
          <UIErrorState
            title="Error Loading User"
            description="We couldn't retrieve the details for this user."
            actionText="Back to Users"
            onAction={() => router.push("/users")}
            className="min-h-[300px]"
          />
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard page={Page.Users} permission={Permission.UPDATE}>
      <div className="w-full space-y-6 max-w-4xl mx-auto py-6">
        <UserForm mode="update" user={data} />
      </div>
    </PermissionGuard>
  );
}
