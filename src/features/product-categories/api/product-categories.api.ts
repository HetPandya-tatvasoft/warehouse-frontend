import { apiClient } from "@/lib/api/axios-instance";
import { API_ROUTES } from "@/shared/constants/api";
import type {
  IApiSuccessResponse,
  IPaginatedResponse,
} from "@/types/api.types";
import type {
  ICategory,
  IGetCategoriesParams,
  IUpsertCategoryPayload,
} from "../types/product-categories.types";

export const productCategoriesApi = {
  getCategories: async (
    params?: IGetCategoriesParams,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IPaginatedResponse<ICategory>>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<IPaginatedResponse<ICategory>>
    >(API_ROUTES.PRODUCT_CATEGORIES, {
      params,
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
    return response.data;
  },

  getCategoryById: async (
    id: string,
  ): Promise<IApiSuccessResponse<ICategory>> => {
    const response = await apiClient.get<IApiSuccessResponse<ICategory>>(
      `${API_ROUTES.PRODUCT_CATEGORIES}/${id}`,
    );
    return response.data;
  },

  createCategory: async (
    payload: IUpsertCategoryPayload,
  ): Promise<IApiSuccessResponse<ICategory>> => {
    const response = await apiClient.post<IApiSuccessResponse<ICategory>>(
      API_ROUTES.PRODUCT_CATEGORIES,
      payload,
    );
    return response.data;
  },

  updateCategory: async ({
    id,
    payload,
  }: {
    id: string;
    payload: IUpsertCategoryPayload;
  }): Promise<IApiSuccessResponse<ICategory>> => {
    const response = await apiClient.patch<IApiSuccessResponse<ICategory>>(
      `${API_ROUTES.PRODUCT_CATEGORIES}/${id}`,
      payload,
    );
    return response.data;
  },

  deleteCategory: async (id: string): Promise<IApiSuccessResponse<null>> => {
    const response = await apiClient.delete<IApiSuccessResponse<null>>(
      `${API_ROUTES.PRODUCT_CATEGORIES}/${id}`,
    );
    return response.data;
  },
};
