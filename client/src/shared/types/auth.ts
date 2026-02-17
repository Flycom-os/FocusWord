export type PermissionString = string; // формат: "mediafiles:0", "pages:2" и т.п.

export interface RoleDto {
  id: number;
  name: string;
  permissions: PermissionString[];
}

export interface AuthUser {
  id: number;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: RoleDto | null;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  access_token: string;
  refreash_token: string;
}


