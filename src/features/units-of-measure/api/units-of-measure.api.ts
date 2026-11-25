import { apiClient } from "@/lib/api/axios-instance";
import { API_ROUTES } from "@/shared/constants/api";
import type {
  IApiSuccessResponse,
  IPaginatedResponse,
} from "@/types/api.types";
import type {
  IUnitOfMeasure,
  ICreateUnitOfMeasurePayload,
  IUpdateUnitOfMeasurePayload,
  IGetUnitsOfMeasureParams,
} from "../types/units-of-measure.types";

export const unitsOfMeasureApi = {
  getUnitsOfMeasure: async (
    params: IGetUnitsOfMeasureParams,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IPaginatedResponse<IUnitOfMeasure>>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<IPaginatedResponse<IUnitOfMeasure>>
    >(API_ROUTES.PRODUCT_UNITS_OF_MEASURE, {
      params,
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
    return response.data;
  },

  getUnitOfMeasureById: async (
    id: string,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IUnitOfMeasure>> => {
    const response = await apiClient.get<IApiSuccessResponse<IUnitOfMeasure>>(
      `${API_ROUTES.PRODUCT_UNITS_OF_MEASURE}/${encodeURIComponent(id)}`,
      {
        ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
      },
    );
    return response.data;
  },

  createUnitOfMeasure: async (
    payload: ICreateUnitOfMeasurePayload,
  ): Promise<IApiSuccessResponse<IUnitOfMeasure>> => {
    const response = await apiClient.post<IApiSuccessResponse<IUnitOfMeasure>>(
      API_ROUTES.PRODUCT_UNITS_OF_MEASURE,
      payload,
    );
    return response.data;
  },

  updateUnitOfMeasure: async ({
    id,
    payload,
  }: {
    id: string;
    payload: IUpdateUnitOfMeasurePayload;
  }): Promise<IApiSuccessResponse<IUnitOfMeasure>> => {
    const response = await apiClient.patch<IApiSuccessResponse<IUnitOfMeasure>>(
      `${API_ROUTES.PRODUCT_UNITS_OF_MEASURE}/${encodeURIComponent(id)}`,
      payload,
    );
    return response.data;
  },

  deleteUnitOfMeasure: async (
    id: string,
  ): Promise<IApiSuccessResponse<null>> => {
    const response = await apiClient.delete<IApiSuccessResponse<null>>(
      `${API_ROUTES.PRODUCT_UNITS_OF_MEASURE}/${encodeURIComponent(id)}`,
    );
    return response.data;
  },
};
