import { queryKeys } from "@/lib/query/query-keys";
import { apiQueryOptions } from "@/lib/query/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantsApi } from "../api/tenants.api";
import type { IGetTenantsParams } from "../types/tenants.types";

export const tenantsQueries = {
  list: (params?: IGetTenantsParams) =>
    apiQueryOptions({
      queryKey: queryKeys.tenants.list(params as Record<string, unknown>),
      queryFn: () => tenantsApi.getTenants(params),
    }),
};

export function useTenants(
  params?: IGetTenantsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...tenantsQueries.list(params),
    ...options,
  });
}

export function useOnboardTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tenantsApi.onboardTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tenants.all(),
      });
    },
  });
}
