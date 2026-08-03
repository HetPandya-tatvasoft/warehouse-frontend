import { apiClient } from "@/lib/api/axios-instance";
import { API_ROUTES } from "@/shared/constants/api";
import type {
  IApiSuccessResponse,
  IPaginatedResponse,
} from "@/types/api.types";
import type {
  ICreateBranchPayload,
  IGetBranchesParams,
  IUpdateBranchPayload,
  IBranch,
} from "../types/branches.types";

export const branchesApi = {
  getBranches: async (
    params?: IGetBranchesParams,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IPaginatedResponse<IBranch>>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<IPaginatedResponse<IBranch>>
    >(API_ROUTES.BRANCHES, {
      params,
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
    return response.data;
  },

  getBranchById: async (id: string): Promise<IApiSuccessResponse<IBranch>> => {
    const response = await apiClient.get<IApiSuccessResponse<IBranch>>(
      `${API_ROUTES.BRANCHES}/${id}`,
    );
    return response.data;
  },

  createBranch: async (
    payload: ICreateBranchPayload,
  ): Promise<IApiSuccessResponse<IBranch>> => {
    const response = await apiClient.post<IApiSuccessResponse<IBranch>>(
      API_ROUTES.BRANCHES,
      payload,
    );
    return response.data;
  },

  updateBranch: async ({
    id,
    payload,
  }: {
    id: string;
    payload: IUpdateBranchPayload;
  }): Promise<IApiSuccessResponse<IBranch>> => {
    const response = await apiClient.put<IApiSuccessResponse<IBranch>>(
      `${API_ROUTES.BRANCHES}/${id}`,
      payload,
    );
    return response.data;
  },

  deleteBranch: async (id: string): Promise<IApiSuccessResponse<null>> => {
    const response = await apiClient.delete<IApiSuccessResponse<null>>(
      `${API_ROUTES.BRANCHES}/${id}`,
    );
    return response.data;
  },
};
