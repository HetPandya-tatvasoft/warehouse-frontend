import { useCallback } from "react";
import { useCurrentUser } from "@/features/auth/queries/auth.queries";
import type { Page, Permission } from "./index";

export function usePermissions() {
  const { data: user, isLoading } = useCurrentUser();

  const can = useCallback(
    (page: Page, permission: Permission): boolean => {
      if (isLoading || !user || !user.permissions) {
        return false;
      }
      const pagePermissions = user.permissions[page];
      if (!pagePermissions) {
        return false;
      }
      return !!pagePermissions[permission];
    },
    [user, isLoading],
  );

  return { can, isLoading };
}
