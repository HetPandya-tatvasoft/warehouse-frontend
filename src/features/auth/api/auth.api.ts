import { apiClient, refreshClient } from "@/lib/api/axios-instance";
import type { ICurrentUser, ILoginDto } from "../types/auth.types";
import type { IApiSuccessResponse } from "@/types/api.types";
import { API_ROUTES } from "@/shared/constants/api";

export const authApi = {
  login,
  logout,
  refreshToken,
  me,
};

async function login(data: ILoginDto): Promise<IApiSuccessResponse<ICurrentUser>> {
  const response = await apiClient.post<IApiSuccessResponse<ICurrentUser>>(
    API_ROUTES.LOGIN,
    data
  );
  return response.data;
}

async function logout(): Promise<IApiSuccessResponse<null>> {
  const response = await apiClient.post<IApiSuccessResponse<null>>(
    API_ROUTES.LOGOUT
  );
  return response.data;
}

async function refreshToken(): Promise<IApiSuccessResponse<ICurrentUser>> {
  const response = await refreshClient.post<IApiSuccessResponse<ICurrentUser>>(
    API_ROUTES.REFRESH_TOKEN
  );

  return response.data;
}
async function me(): Promise<IApiSuccessResponse<ICurrentUser>> {
  const response = await apiClient.get<IApiSuccessResponse<ICurrentUser>>(
    API_ROUTES.ME
  );
  return response.data;
}
