export type RoleSortField = "name" | "createdAt" | "updatedAt";
export type SortOrder = "ASC" | "DESC";

export interface IRole {
  id: string;
  name: string;
  description: string | null;
  tenantId: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IGetRolesParams {
  page?: number;
  pageSize?: number;
  sortBy?: RoleSortField;
  sortOrder?: SortOrder;
}

export interface ICreateRolePayload {
  name: string;
  description?: string;
}

export interface IUpdateRolePayload {
  name?: string;
  description?: string;
}
