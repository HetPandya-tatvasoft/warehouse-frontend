import { apiClient } from "@/lib/api/axios-instance";
import { API_ROUTES } from "@/shared/constants/api";
import type {
  IApiSuccessResponse,
  IPaginatedResponse,
} from "@/types/api.types";
import type {
  ITenant,
  ITenantOnboardingDto,
  IGetTenantsParams,
} from "../types/tenants.types";

export interface ITenantOnboardResponse {
  tenantId: string;
  tenantName: string;
  primaryAdministratorEmail: string;
  temporaryPassword?: string;
}

export const tenantsApi = {
  getTenants: async (
    params?: IGetTenantsParams,
  ): Promise<IApiSuccessResponse<IPaginatedResponse<ITenant>>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<IPaginatedResponse<ITenant>>
    >(API_ROUTES.TENANTS, { params });
    return response.data;
  },

  onboardTenant: async (
    payload: ITenantOnboardingDto,
  ): Promise<IApiSuccessResponse<ITenantOnboardResponse>> => {
    const response = await apiClient.post<
      IApiSuccessResponse<ITenantOnboardResponse>
    >(API_ROUTES.TENANTS, payload);
    return response.data;
  },
};
