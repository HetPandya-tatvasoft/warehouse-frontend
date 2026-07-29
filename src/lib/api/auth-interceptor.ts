import type { AxiosError } from "axios";
import axios from "axios";
import { toast } from "sonner";

import { apiClient, refreshClient } from "./axios-instance";
import type { IRetryAxiosRequestConfig } from "@/types/api.types";
import { getQueryClient } from "@/lib/query/get-query-client";
import { API_ROUTES } from "@/shared/constants/api";

let isRefreshing = false;

let refreshPromise: Promise<void> | null = null;

let interceptorInitialized = false;

export function setupAuthInterceptor() {
  if (typeof window === "undefined") {
    return;
  }

  if (interceptorInitialized) {
    return;
  }

  interceptorInitialized = true;

  apiClient.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      const originalRequest = error.config as IRetryAxiosRequestConfig;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      if (error.response?.status === 403) {
        if (typeof window !== "undefined") {
          if (originalRequest.method?.toLowerCase() === "get") {
            // replace to prevent back button loop where it reverts back to that unauthorized page only
            window.location.replace("/unauthorized");
          } else {
            toast.error("You do not have permission to perform this action.");
          }
        }
        return Promise.reject(error);
      }

      if (error.response?.status !== 401) {
        return Promise.reject(error);
      }

      // Do not attempt to refresh token if the login or logout requests failed (invalid credentials or logged out)
      if (
        originalRequest.url?.includes("auth/login") ||
        originalRequest.url?.includes("auth/logout")
      ) {
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;

          refreshPromise = refreshWithRetry().finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
        }

        await refreshPromise;

        return apiClient(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          getQueryClient().clear();
          window.location.replace("/login");
        }

        return Promise.reject(refreshError);
      }
    },
  );
}

async function refreshWithRetry() {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await refreshClient.post(API_ROUTES.REFRESH_TOKEN);
      return;
    } catch (error) {
      lastError = error;

      // Immediately fail and redirect if the refresh token is invalid
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 400 || status === 401 || status === 403) {
          throw error;
        }
      }

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  throw lastError;
}
