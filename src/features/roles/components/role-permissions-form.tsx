"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

import { UIButton } from "@/components/common/UIButton";
import { Unauthorized } from "@/components/common/Unauthorized";
import {
  useRolePageRights,
  useUpdateRolePageRights,
} from "../queries/roles.queries";
import type { IRolePageRights } from "../types/roles.types";
import {
  buildUpdateRolePermissionsPayload,
  isPermissionPayloadEqual,
} from "../utils/permission-utils";
import { usePermissions, Page, Permission } from "@/permissions";

interface RolePermissionsFormProps {
  roleId: string;
}

function toggleIndividualPermission(
  matrix: IRolePageRights,
  pageId: string,
  permissionName: string,
  forceValue?: boolean,
): IRolePageRights {
  const updatedPages = matrix.pages.map((page) => {
    if (page.pageId !== pageId) return page;

    const targetPerm = page.permissions.find(
      (p) => p.permissionName === permissionName,
    );
    if (!targetPerm) return page;

    const nextValue = forceValue !== undefined ? forceValue : !targetPerm.granted;

    const updatedPermissions = page.permissions.map((perm) => {
      if (perm.permissionName === permissionName) {
        return { ...perm, granted: nextValue };
      }

      if (
        nextValue &&
        (permissionName === "CREATE" ||
          permissionName === "UPDATE" ||
          permissionName === "DELETE")
      ) {
        if (perm.permissionName === "VIEW") {
          return { ...perm, granted: true };
        }
      }

      if (!nextValue && permissionName === "VIEW") {
        if (
          perm.permissionName === "CREATE" ||
          perm.permissionName === "UPDATE" ||
          perm.permissionName === "DELETE"
        ) {
          return { ...perm, granted: false };
        }
      }

      return perm;
    });

    return { ...page, permissions: updatedPermissions };
  });

  return { ...matrix, pages: updatedPages };
}

/**
 * Helper to toggle row-level All checkbox.
 */
function toggleRowAll(matrix: IRolePageRights, pageId: string): IRolePageRights {
  const page = matrix.pages.find((p) => p.pageId === pageId);
  if (!page) return matrix;

  const allChecked = page.permissions.every((p) => p.granted);
  const nextValue = !allChecked;

  const updatedPages = matrix.pages.map((p) => {
    if (p.pageId !== pageId) return p;

    const updatedPermissions = p.permissions.map((perm) => ({
      ...perm,
      granted: nextValue,
    }));

    return { ...p, permissions: updatedPermissions };
  });

  return { ...matrix, pages: updatedPages };
}

/**
 * Helper to toggle column-level All checkbox.
 */
function toggleColumnAll(
  matrix: IRolePageRights,
  permissionName: string,
): IRolePageRights {
  const supportedPages = matrix.pages.filter((p) =>
    p.permissions.some((perm) => perm.permissionName === permissionName),
  );

  const allChecked = supportedPages.every((p) => {
    const perm = p.permissions.find(
      (perm) => perm.permissionName === permissionName,
    );
    return perm ? perm.granted : true;
  });

  const nextValue = !allChecked;

  let currentMatrix = matrix;
  supportedPages.forEach((p) => {
    currentMatrix = toggleIndividualPermission(
      currentMatrix,
      p.pageId,
      permissionName,
      nextValue,
    );
  });

  return currentMatrix;
}

export function RolePermissionsForm({ roleId }: RolePermissionsFormProps) {
  const router = useRouter();

  const { can, isLoading: isAuthLoading } = usePermissions();
  const hasUpdatePermission = can(Page.Roles, Permission.UPDATE);

  const { data: response, isLoading, isError } = useRolePageRights(roleId, {
    enabled: hasUpdatePermission && !isAuthLoading,
  });

  const [originalPermissionMatrix, setOriginalPermissionMatrix] =
    useState<IRolePageRights | null>(null);
  const [editedPermissionMatrix, setEditedPermissionMatrix] =
    useState<IRolePageRights | null>(null);

  useEffect(() => {
    if (response) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOriginalPermissionMatrix(structuredClone(response));
      setEditedPermissionMatrix(structuredClone(response));
    }
  }, [response]);

  const { mutate: updatePermissions, isPending } = useUpdateRolePageRights();

  const permissionNames = useMemo(() => {
    if (!editedPermissionMatrix) return [];
    const names = new Set<string>();
    editedPermissionMatrix.pages.forEach((p) => {
      p.permissions.forEach((perm) => {
        names.add(perm.permissionName);
      });
    });

    const order = ["VIEW", "CREATE", "UPDATE", "DELETE"];
    return Array.from(names).sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [editedPermissionMatrix]);

  const handlePermissionToggle = (pageId: string, permissionName: string) => {
    if (!editedPermissionMatrix) return;
    setEditedPermissionMatrix(
      toggleIndividualPermission(editedPermissionMatrix, pageId, permissionName),
    );
  };

  const handleRowAllToggle = (pageId: string) => {
    if (!editedPermissionMatrix) return;
    setEditedPermissionMatrix(toggleRowAll(editedPermissionMatrix, pageId));
  };

  const handleColumnAllToggle = (permissionName: string) => {
    if (!editedPermissionMatrix) return;
    setEditedPermissionMatrix(
      toggleColumnAll(editedPermissionMatrix, permissionName),
    );
  };

  // Derived dirty state
  const isDirty = useMemo(() => {
    if (!originalPermissionMatrix || !editedPermissionMatrix) return false;
    const originalPayload = buildUpdateRolePermissionsPayload(
      originalPermissionMatrix,
    );
    const editedPayload = buildUpdateRolePermissionsPayload(
      editedPermissionMatrix,
    );
    return !isPermissionPayloadEqual(originalPayload, editedPayload);
  }, [originalPermissionMatrix, editedPermissionMatrix]);

  const handleSave = () => {
    if (!editedPermissionMatrix || !isDirty) return;

    const payload = buildUpdateRolePermissionsPayload(editedPermissionMatrix);

    updatePermissions(
      { roleId, payload },
      {
        onSuccess: () => {
          toast.success("Role permissions updated successfully");
          setOriginalPermissionMatrix(
            structuredClone(editedPermissionMatrix),
          );
          router.push("/roles");
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            toast.error(
              error.response?.data?.message ||
                "Failed to update role permissions",
            );
          } else {
            toast.error("Something went wrong, please try again");
          }
        },
      },
    );
  };

  if (isAuthLoading) {
    return (
      <div className="p-8 text-center text-sm text-zinc-500 animate-pulse">
        Loading session...
      </div>
    );
  }

  if (!hasUpdatePermission) {
    return <Unauthorized />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          <div className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !editedPermissionMatrix) {
    return (
      <div className="flex items-center justify-center min-h-[400px] border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50/50 dark:bg-red-950/20 p-6 text-center">
        <div>
          <h2 className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            Error Loading Permissions
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            We couldn&apos;t retrieve the permission matrix for this role.
          </p>
          <UIButton
            className="mt-4"
            variant="outline"
            onClick={() => router.push("/roles")}
          >
            Back to Roles
          </UIButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      {/* Header card info */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Manage Permissions: {editedPermissionMatrix.roleName}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Grant or revoke page-specific access credentials for this user role.
        </p>
      </div>

      {/* Grouped Permissions checklist in dynamic matrix format */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <th className="py-4 px-5 font-semibold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider w-1/3">
                  Page Name
                </th>
                <th className="py-4 px-5 text-center font-semibold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider w-24">
                  Select All
                </th>
                {permissionNames.map((name) => {
                  const supportedPages = editedPermissionMatrix.pages.filter(
                    (p) => p.permissions.some((perm) => perm.permissionName === name),
                  );
                  const isColChecked =
                    supportedPages.length > 0 &&
                    supportedPages.every((p) => {
                      const perm = p.permissions.find(
                        (perm) => perm.permissionName === name,
                      );
                      return perm ? perm.granted : false;
                    });
                  const isColIndeterminate =
                    !isColChecked &&
                    supportedPages.some((p) => {
                      const perm = p.permissions.find(
                        (perm) => perm.permissionName === name,
                      );
                      return perm ? perm.granted : false;
                    });

                  return (
                    <th
                      key={name}
                      className="py-4 px-5 text-center font-semibold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider"
                    >
                      <div className="flex flex-col items-center gap-1.5 justify-center">
                        <span className="capitalize">{name.toLowerCase()}</span>
                        <input
                          type="checkbox"
                          checked={isColChecked}
                          ref={(el) => {
                            if (el) el.indeterminate = isColIndeterminate;
                          }}
                          onChange={() => handleColumnAllToggle(name)}
                          disabled={isPending}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-zinc-300 dark:border-zinc-700"
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {editedPermissionMatrix.pages.map((page) => {
                const allRowChecked =
                  page.permissions.length > 0 &&
                  page.permissions.every((p) => p.granted);
                const isRowIndeterminate =
                  !allRowChecked && page.permissions.some((p) => p.granted);

                return (
                  <tr
                    key={page.pageId}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors"
                  >
                    <td className="py-4 px-5 font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      {page.pageName}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <input
                        type="checkbox"
                        checked={allRowChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = isRowIndeterminate;
                        }}
                        onChange={() => handleRowAllToggle(page.pageId)}
                        disabled={isPending}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-zinc-300 dark:border-zinc-700"
                      />
                    </td>
                    {permissionNames.map((name) => {
                      const perm = page.permissions.find(
                        (p) => p.permissionName === name,
                      );

                      return (
                        <td key={name} className="py-4 px-5 text-center">
                          {perm ? (
                            <input
                              type="checkbox"
                              checked={perm.granted}
                              disabled={isPending}
                              onChange={() =>
                                handlePermissionToggle(page.pageId, name)
                              }
                              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-zinc-300 dark:border-zinc-700"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Action footer */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <UIButton
          type="button"
          variant="outline"
          onClick={() => router.push("/roles")}
          disabled={isPending}
        >
          Cancel
        </UIButton>
        <UIButton
          type="button"
          onClick={handleSave}
          loading={isPending}
          disabled={!isDirty || isPending}
        >
          Save Changes
        </UIButton>
      </div>
    </div>
  );
}
