export const API_ROUTES = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
  REFRESH_TOKEN: "/auth/refresh-token",
  ROLES: "/roles",
  USERS: "/users",
  BRANCHES: "/branches",
  TENANTS: "/platform/tenants",
  BRANCH_SWITCH: "/auth/switch-branch",
} as const;