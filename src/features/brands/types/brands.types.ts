export enum BrandStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type BrandSortField = "name" | "status" | "createdAt" | "updatedAt";
export type SortOrder = "ASC" | "DESC";

export interface IBrand {
  id: string;
  tenantId: string;
  name: string;
  status: BrandStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IUpsertBrandPayload {
  name: string;
  status?: BrandStatus;
}

export interface IGetBrandsParams {
  page: number;
  pageSize: number;
  sortBy: BrandSortField;
  sortOrder: SortOrder;
  search?: string;
  status?: BrandStatus;
}

export interface StatusOption {
  label: string;
  value: BrandStatus;
}

export const BRAND_STATUS_OPTIONS: StatusOption[] = [
  { label: "Active", value: BrandStatus.ACTIVE },
  { label: "Inactive", value: BrandStatus.INACTIVE },
];
