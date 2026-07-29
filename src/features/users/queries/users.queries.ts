import { queryKeys } from "@/lib/query/query-keys";
import { apiQueryOptions } from "@/lib/query/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users.api";
import type { IGetUsersParams } from "../types/users.types";

export const usersQueries = {
  list: (params?: IGetUsersParams, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.users.list(params as Record<string, unknown>),
      queryFn: () => usersApi.getUsers(params, cookieHeader),
    }),

  detail: (id: string) =>
    apiQueryOptions({
      queryKey: queryKeys.users.detail(id),
      queryFn: () => usersApi.getUserById(id),
      enabled: Boolean(id),
    }),
};

function useUserMutation<TVariables>(
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

export function useUsers(params?: IGetUsersParams, options?: { enabled?: boolean }) {
  return useQuery({
    ...usersQueries.list(params),
    ...options,
  });
}

export function useUser(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...usersQueries.detail(id),
    ...options,
  });
}

export const useCreateUser = () => useUserMutation(usersApi.createUser);

export const useUpdateUser = () => useUserMutation(usersApi.updateUser);

export const useToggleUserStatus = () =>
  useUserMutation(usersApi.toggleUserStatus);
