import { PAGE_ROUTES } from "@/shared/constants/routes";
import { LayoutDashboard, Users, ShieldCheck, GitBranch } from "lucide-react";
import { Page, Permission } from "@/permissions";
import type { NavItem } from "@/components/layout/app-sidebar";

export const tenantNavigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: PAGE_ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Branches",
    href: PAGE_ROUTES.BRANCHES,
    icon: GitBranch,
    page: Page.Branches,
    permission: Permission.VIEW,
  },
  {
    label: "Users",
    href: PAGE_ROUTES.USERS,
    icon: Users,
    page: Page.Users,
    permission: Permission.VIEW,
  },
  {
    label: "Roles",
    href: PAGE_ROUTES.ROLES,
    icon: ShieldCheck,
    page: Page.Roles,
    permission: Permission.VIEW,
  },
];
