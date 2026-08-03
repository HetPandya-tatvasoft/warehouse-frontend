export const PAGE_ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  ROLES: "/roles",
  USERS: "/users",
  BRANCHES: "/branches",
  UNAUTHORIZED: "/unauthorized",
  PLATFORM_DASHBOARD: "/platform/dashboard",
  PLATFORM_TENANTS: "/platform/tenants",
  PLATFORM_TENANTS_CREATE: "/platform/tenants/create",
} as const;

export const PUBLIC_ROUTES = [PAGE_ROUTES.LOGIN];
