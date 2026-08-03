export type UserSortField = "createdAt" | "email" | "firstName" | "lastName";
export type SortOrder = "ASC" | "DESC";

export interface IUserRole {
  id: string;
  name: string;
  description?: string;
}

export interface IUserBranch {
  id: string;
  name: string;
  isPrimary: boolean;
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: IUserRole[];
  branches: IUserBranch[];
}

export interface IGetUsersParams {
  page?: number;
  pageSize?: number;
  sortBy?: UserSortField;
  sortOrder?: SortOrder;
  search?: string;
}

export interface ICreateUserPayload {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
  branchIds: string[];
  primaryBranchId: string;
  isActive?: boolean;
}

export interface IUpdateUserPayload {
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
  branchIds?: string[];
  primaryBranchId?: string;
  isActive?: boolean;
}

export interface IToggleUserStatusPayload {
  isActive: boolean;
}
