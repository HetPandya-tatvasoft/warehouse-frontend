import { queryKeys } from "@/lib/query/query-keys";
import { apiQueryOptions } from "@/lib/query/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { branchesApi } from "../api/branches.api";
import type { IGetBranchesParams } from "../types/branches.types";

export const branchesQueries = {
  list: (params?: IGetBranchesParams, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.branches.list(params as Record<string, unknown>),
      queryFn: () => branchesApi.getBranches(params, cookieHeader),
    }),

  detail: (id: string) =>
    apiQueryOptions({
      queryKey: queryKeys.branches.detail(id),
      queryFn: () => branchesApi.getBranchById(id),
      enabled: Boolean(id),
    }),
};

function useBranchMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.branches.all(),
      }),
  });
}

export function useBranches(
  params?: IGetBranchesParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...branchesQueries.list(params),
    ...options,
  });
}

export function useBranch(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...branchesQueries.detail(id),
    ...options,
  });
}

export const useCreateBranch = () => useBranchMutation(branchesApi.createBranch);

export const useUpdateBranch = () => useBranchMutation(branchesApi.updateBranch);

export const useDeleteBranch = () => useBranchMutation(branchesApi.deleteBranch);
