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
  city: string;
  state: string;
  country: string;
  postalCode: string;
  timezone: string;
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
  city: string;
  state: string;
  country: string;
  postalCode: string;
  branchName: string;
  timezone?: string;
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
