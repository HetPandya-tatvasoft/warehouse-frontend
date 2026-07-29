export enum Page {
  Users = "Users",
  Roles = "Roles",
  Products = "Products",
}

export enum Permission {
  VIEW = "VIEW",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export { usePermissions } from "./use-permissions";

