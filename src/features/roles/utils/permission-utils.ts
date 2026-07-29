import type { IRolePageRights, IUpdateRolePageRightsPayload } from "../types/roles.types";

/**
 * Converts a permission matrix into the payload expected by the update API.
 * Extracts only the pageAccessIds of permissions where granted is true.
 */
export function buildUpdateRolePermissionsPayload(
  permissionMatrix: IRolePageRights | null | undefined,
): IUpdateRolePageRightsPayload {
  if (!permissionMatrix || !permissionMatrix.pages) {
    return { pageAccessIds: [] };
  }

  const pageAccessIds: string[] = [];

  permissionMatrix.pages.forEach((page) => {
    if (page.permissions) {
      page.permissions.forEach((permission) => {
        if (permission.granted && permission.pageAccessId) {
          pageAccessIds.push(permission.pageAccessId);
        }
      });
    }
  });

  return { pageAccessIds };
}

/**
 * Custom deep comparison helper to compare two update page rights payloads.
 * Compares the arrays of pageAccessIds by sorting and checking element-by-element.
 */
export function isPermissionPayloadEqual(
  a: IUpdateRolePageRightsPayload,
  b: IUpdateRolePageRightsPayload,
): boolean {
  const idsA = a.pageAccessIds || [];
  const idsB = b.pageAccessIds || [];

  if (idsA.length !== idsB.length) {
    return false;
  }

  const sortedA = [...idsA].sort();
  const sortedB = [...idsB].sort();

  return sortedA.every((val, index) => val === sortedB[index]);
}
