export const API_ROUTES = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
  REFRESH_TOKEN: "/auth/refresh-token",
  ROLES: "/roles",
  USERS: "/users",
  BRANCHES: "/branches",
  WAREHOUSES: "/warehouses",
  TENANTS: "/platform/tenants",
  TENANTS_ONBOARD: "/platform/tenants/onboard",
  BRANCH_SWITCH: "/auth/switch-branch",
  PRODUCT_CATEGORIES: "/product-settings/categories",
} as const;