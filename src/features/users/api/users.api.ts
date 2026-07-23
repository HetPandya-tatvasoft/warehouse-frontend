import { apiClient } from "@/lib/api/axios-instance";
import { API_ROUTES } from "@/shared/constants/api";
import type {
  IApiSuccessResponse,
  IPaginatedResponse,
} from "@/types/api.types";
import type {
  ICreateUserPayload,
  IGetUsersParams,
  IToggleUserStatusPayload,
  IUpdateUserPayload,
  IUser,
} from "../types/users.types";

export const usersApi = {
  getUsers: async (
    params?: IGetUsersParams,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IPaginatedResponse<IUser>>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<IPaginatedResponse<IUser>>
    >(API_ROUTES.USERS, {
      params,
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
    return response.data;
  },

  getUserById: async (id: string): Promise<IApiSuccessResponse<IUser>> => {
    const response = await apiClient.get<IApiSuccessResponse<IUser>>(
      `${API_ROUTES.USERS}/${id}`,
    );
    return response.data;
  },

  createUser: async (
    payload: ICreateUserPayload,
  ): Promise<IApiSuccessResponse<IUser>> => {
    const response = await apiClient.post<IApiSuccessResponse<IUser>>(
      API_ROUTES.USERS,
      payload,
    );
    return response.data;
  },

  updateUser: async ({
    id,
    payload,
  }: {
    id: string;
    payload: IUpdateUserPayload;
  }): Promise<IApiSuccessResponse<IUser>> => {
    const response = await apiClient.put<IApiSuccessResponse<IUser>>(
      `${API_ROUTES.USERS}/${id}`,
      payload,
    );
    return response.data;
  },

  toggleUserStatus: async ({
    id,
    payload,
  }: {
    id: string;
    payload: IToggleUserStatusPayload;
  }): Promise<IApiSuccessResponse<IUser>> => {
    const response = await apiClient.patch<IApiSuccessResponse<IUser>>(
      `${API_ROUTES.USERS}/${id}/status`,
      payload,
    );
    return response.data;
  },
};
