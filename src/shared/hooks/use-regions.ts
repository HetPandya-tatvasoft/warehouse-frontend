import { apiClient } from "@/lib/api/axios-instance";
import { queryKeys } from "@/lib/query/query-keys";
import { apiQueryOptions } from "@/lib/query/utils";
import { useQuery } from "@tanstack/react-query";
import type { IApiSuccessResponse } from "@/types/api.types";

export interface ICountry {
  id: number;
  name: string;
}

export interface IState {
  id: number;
  name: string;
  countryId: number;
}

export interface ICity {
  id: number;
  name: string;
  stateId: number;
}

export const regionsApi = {
  getCountries: async (): Promise<IApiSuccessResponse<ICountry[]>> => {
    const response =
      await apiClient.get<IApiSuccessResponse<ICountry[]>>(
        "/regions/countries",
      );
    return response.data;
  },

  getStates: async (
    countryId?: number,
  ): Promise<IApiSuccessResponse<IState[]>> => {
    const response = await apiClient.get<IApiSuccessResponse<IState[]>>(
      "/regions/states",
      {
        params: countryId !== undefined ? { countryId } : undefined,
      },
    );
    return response.data;
  },

  getCities: async (
    stateId?: number,
  ): Promise<IApiSuccessResponse<ICity[]>> => {
    const response = await apiClient.get<IApiSuccessResponse<ICity[]>>(
      "/regions/cities",
      {
        params: stateId !== undefined ? { stateId } : undefined,
      },
    );
    return response.data;
  },
};

export const regionsQueries = {
  countries: () =>
    apiQueryOptions({
      queryKey: queryKeys.regions.countries(),
      queryFn: () => regionsApi.getCountries(),
      staleTime: Infinity,
    }),

  states: (countryId?: number) =>
    apiQueryOptions({
      queryKey: queryKeys.regions.states(countryId),
      queryFn: () => regionsApi.getStates(countryId),
      staleTime: Infinity,
      enabled: !!countryId,
    }),

  cities: (stateId?: number) =>
    apiQueryOptions({
      queryKey: queryKeys.regions.cities(stateId),
      queryFn: () => regionsApi.getCities(stateId),
      staleTime: Infinity,
      enabled: !!stateId,
    }),
};

export function useCountries() {
  return useQuery(regionsQueries.countries());
}

export function useStates(countryId?: number) {
  return useQuery(regionsQueries.states(countryId));
}

export function useCities(stateId?: number) {
  return useQuery(regionsQueries.cities(stateId));
}
