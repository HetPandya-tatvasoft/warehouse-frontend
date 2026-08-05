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
  address?: {
    id: string;
    addressLine1: string;
    addressLine2?: string | null;
    cityId: number;
    stateId: number;
    countryId: number;
    postalCode: string;
    city?: {
      id: number;
      name: string;
      stateId: number;
    } | null;
    state?: {
      id: number;
      name: string;
      countryId: number;
    } | null;
    country?: {
      id: number;
      name: string;
    } | null;
  } | null;
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
  cityId?: number;
  stateId?: number;
  countryId?: number;
  postalCode?: string;
}

export interface IUpdateBranchPayload {
  name?: string;
  status?: BranchStatus;
  addressLine1?: string;
  addressLine2?: string;
  cityId?: number;
  stateId?: number;
  countryId?: number;
  postalCode?: string;
}
