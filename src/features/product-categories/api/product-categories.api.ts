import { apiClient } from "@/lib/api/axios-instance";
import { API_ROUTES } from "@/shared/constants/api";
import type {
  IApiSuccessResponse,
  IPaginatedResponse,
} from "@/types/api.types";
import type {
  ICategory,
  ICategoryAttribute,
  IEligibleAttribute,
  IAssignCategoryAttributesPayload,
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

  getCategoryTree: async (
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<ICategory[]>> => {
    const response = await apiClient.get<IApiSuccessResponse<ICategory[]>>(
      `${API_ROUTES.PRODUCT_CATEGORIES}/tree`,
      {
        ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
      },
    );
    return response.data;
  },

  getEffectiveAttributes: async (
    categoryId: string,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<ICategoryAttribute[]>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<ICategoryAttribute[]>
    >(`${API_ROUTES.PRODUCT_CATEGORIES}/${categoryId}/attributes/effective`, {
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
    return response.data;
  },

  getDirectAttributes: async (
    categoryId: string,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<ICategoryAttribute[]>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<ICategoryAttribute[]>
    >(`${API_ROUTES.PRODUCT_CATEGORIES}/${categoryId}/attributes`, {
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
    return response.data;
  },

  getEligibleAttributes: async (
    categoryId: string,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IEligibleAttribute[]>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<IEligibleAttribute[]>
    >(`${API_ROUTES.PRODUCT_CATEGORIES}/${categoryId}/attributes/eligible`, {
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
    return response.data;
  },

  assignCategoryAttributes: async ({
    categoryId,
    payload,
  }: {
    categoryId: string;
    payload: IAssignCategoryAttributesPayload;
  }): Promise<IApiSuccessResponse<ICategoryAttribute[]>> => {
    const response = await apiClient.post<
      IApiSuccessResponse<ICategoryAttribute[]>
    >(`${API_ROUTES.PRODUCT_CATEGORIES}/${categoryId}/attributes`, payload);
    return response.data;
  },

  unassignCategoryAttribute: async ({
    categoryId,
    attributeId,
  }: {
    categoryId: string;
    attributeId: string;
  }): Promise<IApiSuccessResponse<null>> => {
    const response = await apiClient.delete<IApiSuccessResponse<null>>(
      `${API_ROUTES.PRODUCT_CATEGORIES}/${categoryId}/attributes/${attributeId}`,
    );
    return response.data;
  },
};

