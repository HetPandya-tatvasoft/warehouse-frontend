import { queryKeys } from "@/lib/query/query-keys";
import { apiQueryOptions } from "@/lib/query/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "../api/roles.api";
import type { IGetRolesParams, IUpdateRolePageRightsPayload } from "../types/roles.types";

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

  pageRights: (roleId: string) =>
    apiQueryOptions({
      queryKey: queryKeys.roles.pageRights(roleId),
      queryFn: () => rolesApi.getRolePageRights(roleId),
      enabled: Boolean(roleId),
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

export function useRoles(params?: IGetRolesParams, options?: { enabled?: boolean }) {
  return useQuery({
    ...rolesQueries.list(params),
    ...options,
  });
}

export function useRole(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...rolesQueries.detail(id),
    ...options,
  });
}

export const useCreateRole = () => useRoleMutation(rolesApi.createRole);

export const useUpdateRole = () => useRoleMutation(rolesApi.updateRole);

export const useDeleteRole = () => useRoleMutation(rolesApi.deleteRole);

export function useRolePageRights(roleId: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...rolesQueries.pageRights(roleId),
    ...options,
  });
}

export function useUpdateRolePageRights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: IUpdateRolePageRightsPayload;
    }) => rolesApi.updateRolePageRights({ roleId, payload }),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.pageRights(roleId),
      });
    },
  });
}
