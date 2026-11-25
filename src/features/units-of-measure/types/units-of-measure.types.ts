export enum UnitOfMeasureStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type UnitOfMeasureSortField = "name" | "code" | "createdAt";
export type SortOrder = "ASC" | "DESC";

export interface IUnitOfMeasure {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  allowsFractionalQuantity: boolean;
  status: UnitOfMeasureStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateUnitOfMeasurePayload {
  name: string;
  code: string;
  allowsFractionalQuantity: boolean;
  status?: UnitOfMeasureStatus;
}

export interface IUpdateUnitOfMeasurePayload {
  name?: string;
  code?: string;
  allowsFractionalQuantity?: boolean;
  status?: UnitOfMeasureStatus;
}

export interface IGetUnitsOfMeasureParams {
  page: number;
  pageSize: number;
  sortBy: UnitOfMeasureSortField;
  sortOrder: SortOrder;
  search?: string;
  status?: UnitOfMeasureStatus;
}

export interface StatusOption {
  label: string;
  value: UnitOfMeasureStatus;
}

export const UOM_STATUS_OPTIONS: StatusOption[] = [
  { label: "Active", value: UnitOfMeasureStatus.ACTIVE },
  { label: "Inactive", value: UnitOfMeasureStatus.INACTIVE },
];
