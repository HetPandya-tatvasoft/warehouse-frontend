export enum ProductAttributeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type AttributeSortField = "name" | "createdAt";
export type AttributeValueSortField = "label" | "createdAt";
export type SortOrder = "ASC" | "DESC";

export interface IProductAttribute {
  id: string;
  tenantId: string;
  name: string;
  status: ProductAttributeStatus;
  createdAt: string;
  updatedAt: string;
  valueCount: number;
}

export interface IAttributeValue {
  id: string;
  attributeId: string;
  label: string;
  status: ProductAttributeStatus;
  createdAt: string;
  updatedAt: string;
  isAvailableForSelection: boolean;
}

export interface IUpsertAttributePayload {
  name: string;
  status?: ProductAttributeStatus;
}

export interface IUpsertAttributeValuePayload {
  label: string;
  status?: ProductAttributeStatus;
}

export interface IGetAttributesParams {
  page: number;
  pageSize: number;
  sortBy: AttributeSortField;
  sortOrder: SortOrder;
  search?: string;
  status?: ProductAttributeStatus;
}

export interface IGetAttributeValuesParams extends Omit<IGetAttributesParams, "sortBy"> {
  sortBy: AttributeValueSortField;
}

export interface StatusOption {
  label: string;
  value: ProductAttributeStatus;
}

export const ATTRIBUTE_STATUS_OPTIONS: StatusOption[] = [
  { label: "Active", value: ProductAttributeStatus.ACTIVE },
  { label: "Inactive", value: ProductAttributeStatus.INACTIVE },
];
