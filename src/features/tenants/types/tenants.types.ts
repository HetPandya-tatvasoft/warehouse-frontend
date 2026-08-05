export interface ITenantPrimaryAdmin {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ITenant {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  companyEmail: string;
  companyPhone: string;
  addressLine1: string;
  addressLine2?: string;
  country?: {
    id: number;
    name: string;
    code?: string;
  } | null;
  state?: {
    id: number;
    name: string;
    code?: string;
    countryId: number;
  } | null;
  city?: {
    id: number;
    name: string;
    stateId: number;
  } | null;
  postalCode: string;
  createdAt: string;
  updatedAt: string;
  primaryAdmin?: ITenantPrimaryAdmin;
}

export interface ITenantOnboardingDto {
  companyName: string;
  slug: string;
  companyEmail: string;
  companyPhone: string;
  addressLine1: string;
  addressLine2?: string;
  cityId: number;
  stateId: number;
  countryId: number;
  postalCode: string;
  branchName: string;
  primaryAdministrator: ITenantPrimaryAdmin;
}

export interface IGetTenantsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
  status?: string;
}

export type TenantSortField = "name" | "companyEmail" | "status" | "createdAt";
export type SortOrder = "ASC" | "DESC";
