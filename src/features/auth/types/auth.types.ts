import type { Page, Permission } from "@/permissions";

export interface ILoginDto {
  email: string;
  password: string;
}

export interface ICurrentUserBranch {
  id: string;
  name: string;
  isPrimary: boolean;
}

export interface ICurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string | null;
  roles?: string[];
  permissions: Partial<Record<Page, Partial<Record<Permission, boolean>>>>;
  branches?: ICurrentUserBranch[];
  activeBranch?: ICurrentUserBranch | null;
}

export interface IAuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tenantId: string | null;
}
