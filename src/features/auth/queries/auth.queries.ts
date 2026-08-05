import { queryKeys } from "@/lib/query/query-keys";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { apiQueryOptions } from "@/lib/query/utils";

import { regionsQueries } from "@/shared/hooks/use-regions";

export const authQueries = {
  currentUser: () =>
    apiQueryOptions({
      queryKey: queryKeys.auth.currentUser(),
      queryFn: authApi.me,
      retry: false,
    }),
};

export function useCurrentUser() {
  return useQuery(authQueries.currentUser());
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.currentUser(),
      });
      queryClient.prefetchQuery(regionsQueries.countries());
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
  });
}

export function useSwitchBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.switchBranch,
    onSuccess: async (response) => {
      queryClient.setQueryData(queryKeys.auth.currentUser(), response);
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== "current-user",
      });
    },
  });
}
