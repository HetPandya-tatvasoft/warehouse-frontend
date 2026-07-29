"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/queries/auth.queries";
import { PlatformSidebar } from "@/components/layout/platform-sidebar";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { UILoader } from "@/components/common";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.tenantId !== null) {
      router.replace(PAGE_ROUTES.UNAUTHORIZED);
    }
  }, [user, isLoading, router]);

  // Test it like if user comes null then the loader should not be stucked forever
  if (isLoading || !user || user.tenantId !== null) {
    return <UILoader />;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <PlatformSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
