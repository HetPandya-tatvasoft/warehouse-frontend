"use client";

import React from "react";
import { usePermissions } from "./use-permissions";
import type { Page, Permission } from "./index";
import { Unauthorized, UILoader } from "@/components/common";

export interface PermissionGuardProps {
  page: Page;
  permission: Permission;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  page,
  permission,
  fallback,
  loadingFallback,
  children,
}: PermissionGuardProps) {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return loadingFallback ?? <UILoader />;
  }

  if (!can(page, permission)) {
    return <>{fallback ?? <Unauthorized />}</>;
  }

  return <>{children}</>;
}
