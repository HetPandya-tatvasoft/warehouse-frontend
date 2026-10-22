import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { apiQueryOptions } from "@/lib/query/utils";
import { productAttributesApi } from "../api/product-attributes.api";
import type {
  IGetAttributesParams,
  IGetAttributeValuesParams,
} from "../types/product-attributes.types";

export const productAttributesQueries = {
  list: (params: IGetAttributesParams, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.productAttributes.list(params),
      queryFn: () => productAttributesApi.getAttributes(params, cookieHeader),
    }),

  detail: (id: string, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.productAttributes.detail(id),
      queryFn: () => productAttributesApi.getAttributeById(id, cookieHeader),
    }),

  values: (
    id: string,
    params: IGetAttributeValuesParams,
    cookieHeader?: string,
  ) =>
    apiQueryOptions({
      queryKey: queryKeys.productAttributes.values(id, params),
      queryFn: () =>
        productAttributesApi.getAttributeValues(id, params, cookieHeader),
    }),
};

export function useAttributes(
  params: IGetAttributesParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...productAttributesQueries.list(params),
    ...options,
  });
}

export function useAttribute(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...productAttributesQueries.detail(id),
    enabled: Boolean(id) && options?.enabled !== false,
  });
}

export function useAttributeValues(
  id: string,
  params: IGetAttributeValuesParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...productAttributesQueries.values(id, params),
    enabled: Boolean(id) && options?.enabled !== false,
  });
}

function useAttributeMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.productAttributes.all(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.productCategories.all(),
        }),
      ]);
    },
  });
}

export const useCreateAttribute = () =>
  useAttributeMutation(productAttributesApi.createAttribute);

export const useUpdateAttribute = () =>
  useAttributeMutation(productAttributesApi.updateAttribute);

export const useCreateAttributeValue = () =>
  useAttributeMutation(productAttributesApi.createAttributeValue);

export const useUpdateAttributeValue = () =>
  useAttributeMutation(productAttributesApi.updateAttributeValue);

export const useDeleteAttributeValue = () =>
  useAttributeMutation(productAttributesApi.deleteAttributeValue);

export function useDeleteAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productAttributesApi.deleteAttribute,
    onSuccess: async (_response, id) => {
      queryClient.removeQueries({
        queryKey: queryKeys.productAttributes.detail(id),
      });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.productAttributes.all(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.productCategories.all(),
        }),
      ]);
    },
  });
}
