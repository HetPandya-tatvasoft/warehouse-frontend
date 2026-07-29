import { apiClient } from "@/lib/api/axios-instance";
import { API_ROUTES } from "@/shared/constants/api";
import type {
  IApiSuccessResponse,
  IPaginatedResponse,
} from "@/types/api.types";
import type {
  ICreateRolePayload,
  IGetRolesParams,
  IRole,
  IUpdateRolePayload,
  IRolePageRights,
  IUpdateRolePageRightsPayload,
} from "../types/roles.types";

export const rolesApi = {
  getRoles: async (
    params?: IGetRolesParams,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IPaginatedResponse<IRole>>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<IPaginatedResponse<IRole>>
    >(API_ROUTES.ROLES, {
      params,
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
    return response.data;
  },

  getRoleById: async (id: string): Promise<IApiSuccessResponse<IRole>> => {
    const response = await apiClient.get<IApiSuccessResponse<IRole>>(
      `${API_ROUTES.ROLES}/${id}`,
    );
    return response.data;
  },

  createRole: async (
    payload: ICreateRolePayload,
  ): Promise<IApiSuccessResponse<IRole>> => {
    const response = await apiClient.post<IApiSuccessResponse<IRole>>(
      API_ROUTES.ROLES,
      payload,
    );
    return response.data;
  },

  updateRole: async ({
    id,
    payload,
  }: {
    id: string;
    payload: IUpdateRolePayload;
  }): Promise<IApiSuccessResponse<IRole>> => {
    const response = await apiClient.put<IApiSuccessResponse<IRole>>(
      `${API_ROUTES.ROLES}/${id}`,
      payload,
    );
    return response.data;
  },

  deleteRole: async (id: string): Promise<IApiSuccessResponse<null>> => {
    const response = await apiClient.delete<IApiSuccessResponse<null>>(
      `${API_ROUTES.ROLES}/${id}`,
    );
    return response.data;
  },

  getRolePageRights: async (
    roleId: string,
  ): Promise<IApiSuccessResponse<IRolePageRights>> => {
    const response = await apiClient.get<IApiSuccessResponse<IRolePageRights>>(
      `${API_ROUTES.ROLES}/${roleId}/page-rights`,
    );
    return response.data;
  },

  updateRolePageRights: async ({
    roleId,
    payload,
  }: {
    roleId: string;
    payload: IUpdateRolePageRightsPayload;
  }): Promise<IApiSuccessResponse<null>> => {
    const response = await apiClient.put<IApiSuccessResponse<null>>(
      `${API_ROUTES.ROLES}/${roleId}/page-rights`,
      payload,
    );
    return response.data;
  },
};
