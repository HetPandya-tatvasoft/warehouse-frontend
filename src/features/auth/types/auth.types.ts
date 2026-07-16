export interface ILoginDto {
  email: string;
  password: string;
}

export interface ICurrentUser {
  userId: string;
  email: string;
  roles: string[];
  tenantId: string | null;
}


