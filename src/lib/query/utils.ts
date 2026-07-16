import type { QueryKey, UseQueryOptions, DefaultError } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import type { IApiSuccessResponse } from "@/types/api.types";

/**
 * Custom queryOptions wrapper for API calls that return an IApiSuccessResponse envelope.
 * Automatically applies the response selector to extract the inner data payload.
 */
export function apiQueryOptions<
  TData,
  TError = DefaultError,
  TQueryKey extends QueryKey = QueryKey
>(
  options: {
    queryKey: TQueryKey;
    queryFn: () => Promise<IApiSuccessResponse<TData>>;
  } & Omit<
    UseQueryOptions<IApiSuccessResponse<TData>, TError, TData, TQueryKey>,
    "queryKey" | "queryFn" | "select"
  >
) {
  return queryOptions({
    ...options,
    select: (response) => response.data,
  });
}
