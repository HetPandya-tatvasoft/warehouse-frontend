export const PAGE_ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  ROLES: "/roles",
  USERS: "/users",
} as const;

export const PUBLIC_ROUTES = [PAGE_ROUTES.LOGIN];
