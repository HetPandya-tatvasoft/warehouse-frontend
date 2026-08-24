"use client";

import { usePermissions } from "@/permissions";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { settingsNavigationGroups } from "@/config/tenant-navigation";
import type { NavGroup } from "@/components/layout/app-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { can } = usePermissions();

  // Filter items in each navigation group based on permissions
  const filteredGroups: NavGroup[] = settingsNavigationGroups.map((group) => ({
    title: group.title,
    items: group.items.filter(
      (item) => !item.page || !item.permission || can(item.page, item.permission),
    ),
  }));

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <AppSidebar groups={filteredGroups} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
