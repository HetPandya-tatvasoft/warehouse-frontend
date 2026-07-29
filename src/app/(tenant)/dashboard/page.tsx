"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/queries/auth.queries";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { UILoader } from "@/components/common";

export default function DashboardPage() {
  const { data, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && data && data.tenantId === null) {
      router.replace(PAGE_ROUTES.PLATFORM_DASHBOARD);
    }
  }, [data, isLoading, router]);

  // Here also check regarding loader stucking forever if the data comes null
  if (isLoading || (data && data.tenantId === null)) {
    return <UILoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Welcome back! Here is an overview of your session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Email Address
          </span>
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {data?.email || "N/A"}
          </p>
        </div>

        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            User Role
          </span>
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
            {data?.roles?.join(", ") || "Operator"}
          </p>
        </div>

        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-1">
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            User ID
          </span>
          <p className="text-base font-mono font-semibold text-zinc-700 dark:text-zinc-300 truncate">
            {data?.id || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
