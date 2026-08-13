import { queryKeys } from "@/lib/query/query-keys";
import { apiQueryOptions } from "@/lib/query/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { warehousesApi } from "../api/warehouses.api";
import type { IGetWarehousesParams } from "../types/warehouses.types";

export const warehousesQueries = {
  list: (params?: IGetWarehousesParams, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.warehouses.list(params as Record<string, unknown>),
      queryFn: () => warehousesApi.getWarehouses(params, cookieHeader),
    }),

  detail: (id: string) =>
    apiQueryOptions({
      queryKey: queryKeys.warehouses.detail(id),
      queryFn: () => warehousesApi.getWarehouseById(id),
      enabled: Boolean(id),
    }),
};

function useWarehouseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.warehouses.all(),
      }),
  });
}

export function useWarehouses(
  params?: IGetWarehousesParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...warehousesQueries.list(params),
    ...options,
  });
}

export function useWarehouse(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...warehousesQueries.detail(id),
    ...options,
  });
}

export const useCreateWarehouse = () =>
  useWarehouseMutation(warehousesApi.createWarehouse);


export const useUpdateWarehouseGeneral = () =>
  useWarehouseMutation(warehousesApi.updateWarehouseGeneral);

export const useUpdateWarehouseAddress = () =>
  useWarehouseMutation(warehousesApi.updateWarehouseAddress);

export const useUpdateWarehouseContacts = () =>
  useWarehouseMutation(warehousesApi.updateWarehouseContacts);

export const useDeleteWarehouse = () =>
  useWarehouseMutation(warehousesApi.deleteWarehouse);

export function useContactSearch(search: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["warehouses", "contact-search", search],
    queryFn: () => warehousesApi.contactSearch(search),
    enabled: options?.enabled ?? true,
    select: (response) => response.data,
  });
}
