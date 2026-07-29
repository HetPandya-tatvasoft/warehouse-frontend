export const PAGE_ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  ROLES: "/roles",
  USERS: "/users",
  UNAUTHORIZED: "/unauthorized",
} as const;

export const PUBLIC_ROUTES = [PAGE_ROUTES.LOGIN];
