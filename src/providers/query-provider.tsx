"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/query/get-query-client";
import { setupAuthInterceptor } from "@/lib/api/auth-interceptor";

type Props = {
  children: React.ReactNode;
};

setupAuthInterceptor();

export function QueryProvider({ children }: Props) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
