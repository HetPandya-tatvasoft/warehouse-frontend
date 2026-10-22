export const PAGE_ROUTES = {
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  DASHBOARD: "/dashboard",
  ROLES: "/roles",
  USERS: "/users",
  BRANCHES: "/branches",
  WAREHOUSES: "/warehouses",
  WAREHOUSES_CREATE: "/warehouses/create",
  PRODUCT_CATEGORIES: "/settings/product-settings/categories",
  PRODUCT_ATTRIBUTES: "/settings/product-settings/attributes",
  PRODUCT_BRANDS: "/settings/product-settings/brands",
  SETTINGS: "/settings",
  UNAUTHORIZED: "/unauthorized",
  PLATFORM_DASHBOARD: "/platform/dashboard",
  PLATFORM_TENANTS: "/platform/tenants",
  PLATFORM_TENANTS_CREATE: "/platform/tenants/create",
} as const;

export const PUBLIC_ROUTES = [
  PAGE_ROUTES.LOGIN,
  PAGE_ROUTES.FORGOT_PASSWORD,
  PAGE_ROUTES.RESET_PASSWORD,
];
