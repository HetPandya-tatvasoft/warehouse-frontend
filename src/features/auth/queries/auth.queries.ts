import { queryKeys } from "@/lib/query/query-keys";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { apiQueryOptions } from "@/lib/query/utils";

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
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
  });
}
