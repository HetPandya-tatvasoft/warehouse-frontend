import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { apiQueryOptions } from "@/lib/query/utils";
import { brandsApi } from "../api/brands.api";
import type { IGetBrandsParams } from "../types/brands.types";

export const brandQueries = {
  list: (params: IGetBrandsParams, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.brands.list(params),
      queryFn: () => brandsApi.getBrands(params, cookieHeader),
    }),

  detail: (id: string, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.brands.detail(id),
      queryFn: () => brandsApi.getBrandById(id, cookieHeader),
    }),
};

export function useBrands(
  params: IGetBrandsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...brandQueries.list(params),
    ...options,
  });
}

export function useBrand(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...brandQueries.detail(id),
    enabled: Boolean(id) && options?.enabled !== false,
  });
}

function useBrandMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.brands.all(),
      });
    },
  });
}

export const useCreateBrand = () =>
  useBrandMutation(brandsApi.createBrand);

export const useUpdateBrand = () =>
  useBrandMutation(brandsApi.updateBrand);

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: brandsApi.deleteBrand,
    onSuccess: async (_response, id) => {
      queryClient.removeQueries({
        queryKey: queryKeys.brands.detail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.brands.all(),
      });
    },
  });
}
