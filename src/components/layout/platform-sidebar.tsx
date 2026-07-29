"use client";

import { usePermissions } from "@/permissions";
import { AppSidebar } from "./app-sidebar";
import { platformNavigationItems } from "@/config/platform-navigation";

export function PlatformSidebar() {
  const { can } = usePermissions();

  const filteredItems = platformNavigationItems.filter(
    (item) => !item.page || !item.permission || can(item.page, item.permission),
  );

  return <AppSidebar items={filteredItems} />;
}
