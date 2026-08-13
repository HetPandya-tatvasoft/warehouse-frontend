export enum WarehouseStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type WarehouseSortField =
  | "name"
  | "code"
  | "status"
  | "isDefault"
  | "createdAt"
  | "updatedAt";

export type SortOrder = "ASC" | "DESC";

export interface IWarehouseContactUpsert {
  id?: string;
  userId?: string | null;
  fullName: string;
  email?: string | null;
  phone: string;
  isDefault: boolean;
}

export interface IUpsertWarehousePayload {
  name: string;
  code: string;
  status: WarehouseStatus;
  isDefault?: boolean;
  addressLine1: string;
  addressLine2?: string;
  countryId: number;
  stateId: number;
  cityId: number;
  postalCode: string;
  contacts: IWarehouseContactUpsert[];
}

export interface IWarehouse {
  id: string;
  branchId: string;
  addressId: string;
  name: string;
  code: string;
  status: WarehouseStatus;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  address?: {
    id: string;
    addressLine1: string;
    addressLine2?: string | null;
    countryId: number;
    stateId: number;
    cityId: number;
    postalCode: string;
  } | null;
  branch?: {
    id: string;
    name: string;
  } | null;
  contacts?: {
    id: string;
    userId?: string | null;
    fullName: string;
    email?: string | null;
    phone: string;
    isDefault: boolean;
  }[] | null;
}

export interface IGetWarehousesParams {
  page?: number;
  pageSize?: number;
  sortBy?: WarehouseSortField;
  sortOrder?: SortOrder;
  search?: string;
  status?: WarehouseStatus;
}

export interface ISearchSystemUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
}

export interface ISearchContact {
  id: string;
  userId: string | null;
  fullName: string;
  email: string | null;
  phone: string;
}

export interface IContactSearchResponse {
  systemUsers: ISearchSystemUser[];
  contacts: ISearchContact[];
}

export interface IStatusOption {
  label: string;
  value: WarehouseStatus;
}

export const WAREHOUSE_STATUS_OPTIONS: IStatusOption[] = [
  { label: "Active", value: WarehouseStatus.ACTIVE },
  { label: "Inactive", value: WarehouseStatus.INACTIVE },
];
