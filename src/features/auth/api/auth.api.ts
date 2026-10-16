import { apiClient, refreshClient } from "@/lib/api/axios-instance";
import type {
  ICurrentUser,
  IAuthUser,
  ILoginDto,
  IForgotPasswordDto,
  IResetPasswordDto,
} from "../types/auth.types";
import type { IApiSuccessResponse } from "@/types/api.types";
import { API_ROUTES } from "@/shared/constants/api";

export const authApi = {
  login,
  logout,
  refreshToken,
  me,
  switchBranch,
  forgotPassword,
  resetPassword,
};

async function login(data: ILoginDto): Promise<IApiSuccessResponse<IAuthUser>> {
  const response = await apiClient.post<IApiSuccessResponse<IAuthUser>>(
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

async function refreshToken(): Promise<IApiSuccessResponse<IAuthUser>> {
  const response = await refreshClient.post<IApiSuccessResponse<IAuthUser>>(
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

async function switchBranch(branchId: string): Promise<IApiSuccessResponse<ICurrentUser>> {
  const response = await apiClient.post<IApiSuccessResponse<ICurrentUser>>(
    API_ROUTES.BRANCH_SWITCH,
    { branchId }
  );
  return response.data;
}

async function forgotPassword(
  data: IForgotPasswordDto
): Promise<IApiSuccessResponse<null>> {
  const response = await apiClient.post<IApiSuccessResponse<null>>(
    API_ROUTES.FORGOT_PASSWORD,
    data
  );
  return response.data;
}

async function resetPassword(
  data: IResetPasswordDto
): Promise<IApiSuccessResponse<null>> {
  const response = await apiClient.post<IApiSuccessResponse<null>>(
    API_ROUTES.RESET_PASSWORD,
    data
  );
  return response.data;
}

