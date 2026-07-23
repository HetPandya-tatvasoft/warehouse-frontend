"use client";

import { useUser } from "@/features/users/queries/users.queries";
import { UserForm } from "@/features/users/components/user-form";
import { useParams } from "next/navigation";

export default function EditUserPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading, isError } = useUser(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse space-y-2 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading user details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center min-h-[200px] border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50/50 dark:bg-red-950/20 p-6 text-center">
        <div>
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            Error Loading Profile
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            We couldn&apos;t retrieve the details for this team member.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-4xl mx-auto py-6">
      <UserForm mode="update" user={data} />
    </div>
  );
}
