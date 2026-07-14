import { SetMetadata } from "@nestjs/common";

export const ROLE_KEY = 'role';
export const Roles = (...roles: string[]) => SetMetadata(ROLE_KEY, roles);