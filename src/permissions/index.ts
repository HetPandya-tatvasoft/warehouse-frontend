export enum Page {
  Users = "Users",
  Roles = "Roles",
  Products = "Products",
  Branches = "Branches",
  Warehouses = "Warehouses",
  ProductCategories = "ProductCategories",
  ProductAttributes = "ProductAttributes",
}

export enum Permission {
  VIEW = "VIEW",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export { usePermissions } from "./use-permissions";
export { PermissionGuard } from "./PermissionGuard";
export type { PermissionGuardProps } from "./PermissionGuard";

