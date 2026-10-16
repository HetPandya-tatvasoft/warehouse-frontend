import { PAGE_ROUTES } from "@/shared/constants/routes";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  GitBranch,
  Warehouse,
  FolderTree,
  ArrowLeft,
  Tag,
  Scale,
  Percent,
} from "lucide-react";
import { Page, Permission } from "@/permissions";
import type { NavItem, NavGroup } from "@/components/layout/app-sidebar";

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
    label: "Warehouses",
    href: PAGE_ROUTES.WAREHOUSES,
    icon: Warehouse,
    page: Page.Warehouses,
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

export const settingsNavigationGroups: NavGroup[] = [
  {
    title: "System",
    items: [
      {
        label: "Back to App",
        href: PAGE_ROUTES.DASHBOARD,
        icon: ArrowLeft,
      },
    ],
  },
  {
    title: "Product Settings",
    items: [
      {
        label: "Categories",
        href: PAGE_ROUTES.PRODUCT_CATEGORIES,
        icon: FolderTree,
        page: Page.ProductCategories,
        permission: Permission.VIEW,
      },
      {
        label: "Attributes",
        href: PAGE_ROUTES.PRODUCT_ATTRIBUTES,
        icon: Tag,
        page: Page.ProductAttributes,
        permission: Permission.VIEW,
      },
      {
        label: "Brands",
        href: "/settings/product-settings/brands",
        icon: Tag,
        disabled: true,
      },
      {
        label: "Units",
        href: "/settings/product-settings/units",
        icon: Scale,
        disabled: true,
      },
    ],
  },
  {
    title: "General Settings",
    items: [
      {
        label: "Taxes",
        href: "/settings/general/taxes",
        icon: Percent,
        disabled: true,
      },
    ],
  },
];
