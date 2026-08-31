export enum ProductCategoryStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type CategorySortField = "name" | "status" | "createdAt" | "updatedAt";

export type SortOrder = "ASC" | "DESC";

export interface ICategory {
  id: string;
  name: string;
  description?: string | null;
  status: ProductCategoryStatus;
  parentId: string | null;
  children: ICategory[];
  createdAt: string;
  updatedAt: string;
}

export interface IGetCategoriesParams {
  page?: number;
  pageSize?: number;
  sortBy?: CategorySortField;
  sortOrder?: SortOrder;
  search?: string;
  status?: ProductCategoryStatus;
}

export interface IUpsertCategoryPayload {
  name: string;
  description?: string;
  status: ProductCategoryStatus;
  parentId?: string | null;
}

export interface ICategoryStatusOption {
  label: string;
  value: ProductCategoryStatus;
}

export const CATEGORY_STATUS_OPTIONS: ICategoryStatusOption[] = [
  { label: "Active", value: ProductCategoryStatus.ACTIVE },
  { label: "Inactive", value: ProductCategoryStatus.INACTIVE },
];
