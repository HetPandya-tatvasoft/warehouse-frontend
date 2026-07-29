import { LayoutDashboard } from "lucide-react";
import type { NavItem } from "@/components/layout/app-sidebar";
import { PAGE_ROUTES } from "@/shared/constants/routes";

export const platformNavigationItems: NavItem[] = [
  {
    label: "Platform Dashboard",
    href: PAGE_ROUTES.PLATFORM_DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Tenants",
    href: PAGE_ROUTES.PLATFORM_TENANTS,
    icon: LayoutDashboard,
  },
];
