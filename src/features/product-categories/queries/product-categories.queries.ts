import { queryKeys } from "@/lib/query/query-keys";
import { apiQueryOptions } from "@/lib/query/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productCategoriesApi } from "../api/product-categories.api";
import type { IGetCategoriesParams } from "../types/product-categories.types";

export const productCategoriesQueries = {
  list: (params?: IGetCategoriesParams, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.productCategories.list(params as Record<string, unknown>),
      queryFn: () => productCategoriesApi.getCategories(params, cookieHeader),
    }),

  detail: (id: string) =>
    apiQueryOptions({
      queryKey: queryKeys.productCategories.detail(id),
      queryFn: () => productCategoriesApi.getCategoryById(id),
      enabled: Boolean(id),
    }),

  tree: (cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.productCategories.tree(),
      queryFn: () => productCategoriesApi.getCategoryTree(cookieHeader),
    }),

  effectiveAttributes: (categoryId: string, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.productCategories.effectiveAttributes(categoryId),
      queryFn: () =>
        productCategoriesApi.getEffectiveAttributes(categoryId, cookieHeader),
      enabled: Boolean(categoryId),
    }),

  directAttributes: (categoryId: string, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.productCategories.attributes(categoryId),
      queryFn: () =>
        productCategoriesApi.getDirectAttributes(categoryId, cookieHeader),
      enabled: Boolean(categoryId),
    }),

  eligibleAttributes: (categoryId: string, cookieHeader?: string) =>
    apiQueryOptions({
      queryKey: queryKeys.productCategories.eligibleAttributes(categoryId),
      queryFn: () =>
        productCategoriesApi.getEligibleAttributes(categoryId, cookieHeader),
      enabled: Boolean(categoryId),
    }),
};

function useCategoryMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.productCategories.all(),
      }),
  });
}

export function useCategories(
  params?: IGetCategoriesParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...productCategoriesQueries.list(params),
    ...options,
  });
}

export function useCategory(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    ...productCategoriesQueries.detail(id),
    ...options,
  });
}

export const useCreateCategory = () =>
  useCategoryMutation(productCategoriesApi.createCategory);

export const useUpdateCategory = () =>
  useCategoryMutation(productCategoriesApi.updateCategory);

export const useDeleteCategory = () =>
  useCategoryMutation(productCategoriesApi.deleteCategory);

export function useCategoryTree(options?: { enabled?: boolean }) {
  return useQuery({
    ...productCategoriesQueries.tree(),
    ...options,
  });
}

export function useCategoryEffectiveAttributes(
  categoryId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...productCategoriesQueries.effectiveAttributes(categoryId),
    enabled: Boolean(categoryId) && options?.enabled !== false,
  });
}

export function useCategoryDirectAttributes(
  categoryId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...productCategoriesQueries.directAttributes(categoryId),
    enabled: Boolean(categoryId) && options?.enabled !== false,
  });
}

export function useCategoryEligibleAttributes(
  categoryId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...productCategoriesQueries.eligibleAttributes(categoryId),
    enabled: Boolean(categoryId) && options?.enabled !== false,
  });
}

export const useAssignCategoryAttributes = () =>
  useCategoryMutation(productCategoriesApi.assignCategoryAttributes);

export const useUnassignCategoryAttribute = () =>
  useCategoryMutation(productCategoriesApi.unassignCategoryAttribute);

