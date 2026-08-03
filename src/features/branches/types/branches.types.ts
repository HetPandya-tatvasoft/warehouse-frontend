export enum BranchStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type BranchSortField = "name" | "status" | "createdAt" | "updatedAt";
export type SortOrder = "ASC" | "DESC";

export interface IBranch {
  id: string;
  tenantId: string;
  name: string;
  status: BranchStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface IGetBranchesParams {
  page?: number;
  pageSize?: number;
  sortBy?: BranchSortField;
  sortOrder?: SortOrder;
  search?: string;
  status?: BranchStatus;
}

export interface ICreateBranchPayload {
  name: string;
  status?: BranchStatus;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface IUpdateBranchPayload {
  name?: string;
  status?: BranchStatus;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}
