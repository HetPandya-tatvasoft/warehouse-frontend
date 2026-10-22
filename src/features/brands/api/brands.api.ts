import { apiClient } from "@/lib/api/axios-instance";
import { API_ROUTES } from "@/shared/constants/api";
import type {
  IApiSuccessResponse,
  IPaginatedResponse,
} from "@/types/api.types";
import type {
  IBrand,
  IGetBrandsParams,
  IUpsertBrandPayload,
} from "../types/brands.types";

export const brandsApi = {
  getBrands: async (
    params: IGetBrandsParams,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IPaginatedResponse<IBrand>>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<IPaginatedResponse<IBrand>>
    >(API_ROUTES.PRODUCT_BRANDS, {
      params,
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
    return response.data;
  },

  getBrandById: async (
    id: string,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IBrand>> => {
    const response = await apiClient.get<IApiSuccessResponse<IBrand>>(
      `${API_ROUTES.PRODUCT_BRANDS}/${encodeURIComponent(id)}`,
      {
        ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
      },
    );
    return response.data;
  },

  createBrand: async (
    payload: IUpsertBrandPayload,
  ): Promise<IApiSuccessResponse<IBrand>> => {
    const response = await apiClient.post<IApiSuccessResponse<IBrand>>(
      API_ROUTES.PRODUCT_BRANDS,
      payload,
    );
    return response.data;
  },

  updateBrand: async ({
    id,
    payload,
  }: {
    id: string;
    payload: IUpsertBrandPayload;
  }): Promise<IApiSuccessResponse<IBrand>> => {
    const response = await apiClient.patch<IApiSuccessResponse<IBrand>>(
      `${API_ROUTES.PRODUCT_BRANDS}/${encodeURIComponent(id)}`,
      payload,
    );
    return response.data;
  },

  deleteBrand: async (id: string): Promise<IApiSuccessResponse<null>> => {
    const response = await apiClient.delete<IApiSuccessResponse<null>>(
      `${API_ROUTES.PRODUCT_BRANDS}/${encodeURIComponent(id)}`,
    );
    return response.data;
  },
};
