import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { apiQueryOptions } from "@/lib/query/utils";
import { unitsOfMeasureApi } from "../api/units-of-measure.api";
import type { IGetUnitsOfMeasureParams } from "../types/units-of-measure.types";

export const unitsOfMeasureQueries = {
  list: (params: IGetUnitsOfMeasureParams, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.unitsOfMeasure.list(params),
      queryFn: () => unitsOfMeasureApi.getUnitsOfMeasure(params, cookieHeader),
    }),

  detail: (id: string, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.unitsOfMeasure.detail(id),
      queryFn: () => unitsOfMeasureApi.getUnitOfMeasureById(id, cookieHeader),
    }),
};

export function useUnitsOfMeasure(
  params: IGetUnitsOfMeasureParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...unitsOfMeasureQueries.list(params),
    ...options,
  });
}

export function useUnitOfMeasure(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...unitsOfMeasureQueries.detail(id),
    enabled: Boolean(id) && options?.enabled !== false,
  });
}

export function useCreateUnitOfMeasure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unitsOfMeasureApi.createUnitOfMeasure,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.unitsOfMeasure.all(),
      });
    },
  });
}

export function useUpdateUnitOfMeasure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unitsOfMeasureApi.updateUnitOfMeasure,
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.unitsOfMeasure.detail(variables.id),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.unitsOfMeasure.all(),
      });
    },
  });
}

export function useDeleteUnitOfMeasure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unitsOfMeasureApi.deleteUnitOfMeasure,
    onSuccess: async (_response, id) => {
      queryClient.removeQueries({
        queryKey: queryKeys.unitsOfMeasure.detail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.unitsOfMeasure.all(),
      });
    },
  });
}
