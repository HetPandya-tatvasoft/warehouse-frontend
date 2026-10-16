import { apiClient } from "@/lib/api/axios-instance";
import { API_ROUTES } from "@/shared/constants/api";
import type {
  IApiSuccessResponse,
  IPaginatedResponse,
} from "@/types/api.types";
import type {
  IProductAttribute,
  IAttributeValue,
  IGetAttributesParams,
  IGetAttributeValuesParams,
  IUpsertAttributePayload,
  IUpsertAttributeValuePayload,
} from "../types/product-attributes.types";

export const productAttributesApi = {
  getAttributes: async (
    params: IGetAttributesParams,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IPaginatedResponse<IProductAttribute>>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<IPaginatedResponse<IProductAttribute>>
    >(API_ROUTES.PRODUCT_ATTRIBUTES, {
      params,
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
    return response.data;
  },

  getAttributeById: async (
    id: string,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IProductAttribute>> => {
    const response = await apiClient.get<IApiSuccessResponse<IProductAttribute>>(
      `${API_ROUTES.PRODUCT_ATTRIBUTES}/${encodeURIComponent(id)}`,
      {
        ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
      },
    );
    return response.data;
  },

  createAttribute: async (
    payload: IUpsertAttributePayload,
  ): Promise<IApiSuccessResponse<IProductAttribute>> => {
    const response = await apiClient.post<IApiSuccessResponse<IProductAttribute>>(
      API_ROUTES.PRODUCT_ATTRIBUTES,
      payload,
    );
    return response.data;
  },

  updateAttribute: async ({
    id,
    payload,
  }: {
    id: string;
    payload: IUpsertAttributePayload;
  }): Promise<IApiSuccessResponse<IProductAttribute>> => {
    const response = await apiClient.patch<IApiSuccessResponse<IProductAttribute>>(
      `${API_ROUTES.PRODUCT_ATTRIBUTES}/${encodeURIComponent(id)}`,
      payload,
    );
    return response.data;
  },

  deleteAttribute: async (id: string): Promise<IApiSuccessResponse<null>> => {
    const response = await apiClient.delete<IApiSuccessResponse<null>>(
      `${API_ROUTES.PRODUCT_ATTRIBUTES}/${encodeURIComponent(id)}`,
    );
    return response.data;
  },

  getAttributeValues: async (
    attributeId: string,
    params: IGetAttributeValuesParams,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IPaginatedResponse<IAttributeValue>>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<IPaginatedResponse<IAttributeValue>>
    >(
      `${API_ROUTES.PRODUCT_ATTRIBUTES}/${encodeURIComponent(attributeId)}/values`,
      {
        params,
        ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
      },
    );
    return response.data;
  },

  createAttributeValue: async ({
    attributeId,
    payload,
  }: {
    attributeId: string;
    payload: IUpsertAttributeValuePayload;
  }): Promise<IApiSuccessResponse<IAttributeValue>> => {
    const response = await apiClient.post<IApiSuccessResponse<IAttributeValue>>(
      `${API_ROUTES.PRODUCT_ATTRIBUTES}/${encodeURIComponent(attributeId)}/values`,
      payload,
    );
    return response.data;
  },

  updateAttributeValue: async ({
    attributeId,
    id,
    payload,
  }: {
    attributeId: string;
    id: string;
    payload: IUpsertAttributeValuePayload;
  }): Promise<IApiSuccessResponse<IAttributeValue>> => {
    const response = await apiClient.patch<IApiSuccessResponse<IAttributeValue>>(
      `${API_ROUTES.PRODUCT_ATTRIBUTES}/${encodeURIComponent(attributeId)}/values/${encodeURIComponent(id)}`,
      payload,
    );
    return response.data;
  },

  deleteAttributeValue: async ({
    attributeId,
    id,
  }: {
    attributeId: string;
    id: string;
  }): Promise<IApiSuccessResponse<null>> => {
    const response = await apiClient.delete<IApiSuccessResponse<null>>(
      `${API_ROUTES.PRODUCT_ATTRIBUTES}/${encodeURIComponent(attributeId)}/values/${encodeURIComponent(id)}`,
    );
    return response.data;
  },
};
