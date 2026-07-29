"use client";

import { UserForm } from "@/features/users/components/user-form";
import { usePermissions, Page, Permission } from "@/permissions";
import { Unauthorized } from "@/components/common/Unauthorized";

export default function CreateUserPage() {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">
          Checking permissions...
        </p>
      </div>
    );
  }

  if (!can(Page.Users, Permission.CREATE)) {
    return <Unauthorized />;
  }

  return (
    <div className="w-full space-y-6 max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Add New Team Member
        </h1>
      </div>
      <UserForm mode="create" />
    </div>
  );
}
