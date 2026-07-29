"use client";

import { usePermissions } from "@/permissions";
import { AppSidebar } from "./app-sidebar";
import { tenantNavigationItems } from "@/config/tenant-navigation";

export function TenantSidebar() {
  const { can } = usePermissions();

  const filteredItems = tenantNavigationItems.filter(
    (item) => !item.page || !item.permission || can(item.page, item.permission),
  );

  return <AppSidebar items={filteredItems} />;
}
