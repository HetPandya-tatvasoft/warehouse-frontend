import { queryKeys } from "@/lib/query/query-keys";
import { apiQueryOptions } from "@/lib/query/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "../api/roles.api";
import type { IGetRolesParams } from "../types/roles.types";

export const rolesQueries = {
  list: (params?: IGetRolesParams, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.roles.list(params),
      queryFn: () => rolesApi.getRoles(params, cookieHeader),
    }),

  detail: (id: string) =>
    apiQueryOptions({
      queryKey: queryKeys.roles.detail(id),
      queryFn: () => rolesApi.getRoleById(id),
      enabled: Boolean(id),
    }),
};

function useRoleMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.all(),
      }),
  });
}

export function useRoles(params?: IGetRolesParams) {
  return useQuery(rolesQueries.list(params));
}

export function useRole(id: string) {
  return useQuery(rolesQueries.detail(id));
}

export const useCreateRole = () => useRoleMutation(rolesApi.createRole);

export const useUpdateRole = () => useRoleMutation(rolesApi.updateRole);

export const useDeleteRole = () => useRoleMutation(rolesApi.deleteRole);
