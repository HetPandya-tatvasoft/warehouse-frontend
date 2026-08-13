import { apiClient } from "@/lib/api/axios-instance";
import { API_ROUTES } from "@/shared/constants/api";
import type {
  IApiSuccessResponse,
  IPaginatedResponse,
} from "@/types/api.types";
import type {
  WarehouseStatus,
  IGetWarehousesParams,
  IWarehouse,
  IUpsertWarehousePayload,
  IContactSearchResponse,
} from "../types/warehouses.types";

export const warehousesApi = {
  getWarehouses: async (
    params?: IGetWarehousesParams,
    cookieHeader?: string,
  ): Promise<IApiSuccessResponse<IPaginatedResponse<IWarehouse>>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<IPaginatedResponse<IWarehouse>>
    >(API_ROUTES.WAREHOUSES, {
      params,
      ...(cookieHeader ? { headers: { Cookie: cookieHeader } } : {}),
    });
    return response.data;
  },

  getWarehouseById: async (
    id: string,
  ): Promise<IApiSuccessResponse<IWarehouse>> => {
    const response = await apiClient.get<IApiSuccessResponse<IWarehouse>>(
      `${API_ROUTES.WAREHOUSES}/${id}`,
    );
    return response.data;
  },

  createWarehouse: async (
    payload: IUpsertWarehousePayload,
  ): Promise<IApiSuccessResponse<IWarehouse>> => {
    const response = await apiClient.post<IApiSuccessResponse<IWarehouse>>(
      API_ROUTES.WAREHOUSES,
      payload,
    );
    return response.data;
  },


  updateWarehouseGeneral: async ({
    id,
    payload,
  }: {
    id: string;
    payload: {
      name: string;
      code: string;
      status: WarehouseStatus;
      isDefault?: boolean;
    };
  }): Promise<IApiSuccessResponse<IWarehouse>> => {
    const response = await apiClient.patch<IApiSuccessResponse<IWarehouse>>(
      `${API_ROUTES.WAREHOUSES}/${id}/general`,
      payload,
    );
    return response.data;
  },

  updateWarehouseAddress: async ({
    id,
    payload,
  }: {
    id: string;
    payload: {
      addressLine1: string;
      addressLine2?: string;
      countryId: number;
      stateId: number;
      cityId: number;
      postalCode: string;
    };
  }): Promise<IApiSuccessResponse<IWarehouse>> => {
    const response = await apiClient.patch<IApiSuccessResponse<IWarehouse>>(
      `${API_ROUTES.WAREHOUSES}/${id}/address`,
      payload,
    );
    return response.data;
  },

  updateWarehouseContacts: async ({
    id,
    payload,
  }: {
    id: string;
    payload: {
      contacts: Array<{
        id?: string;
        userId?: string | null;
        fullName: string;
        email: string;
        phone: string;
        isDefault?: boolean;
      }>;
    };
  }): Promise<IApiSuccessResponse<IWarehouse>> => {
    const response = await apiClient.patch<IApiSuccessResponse<IWarehouse>>(
      `${API_ROUTES.WAREHOUSES}/${id}/contacts`,
      payload,
    );
    return response.data;
  },

  deleteWarehouse: async (id: string): Promise<IApiSuccessResponse<null>> => {
    const response = await apiClient.delete<IApiSuccessResponse<null>>(
      `${API_ROUTES.WAREHOUSES}/${id}`,
    );
    return response.data;
  },

  contactSearch: async (
    search: string,
  ): Promise<IApiSuccessResponse<IContactSearchResponse>> => {
    const response = await apiClient.get<
      IApiSuccessResponse<IContactSearchResponse>
    >(`${API_ROUTES.WAREHOUSES}/contact-search`, {
      params: { search },
    });
    return response.data;
  },
};
