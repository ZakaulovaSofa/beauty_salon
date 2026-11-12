import { SetMetadata } from '@nestjs/common';

import type { Role } from '../../common/enums/role.enum.js';

export const ROLES_KEY = 'auth:roles';
export const AUTH_MODE_KEY = 'auth:mode';

export type AuthMode = 'public' | 'optional';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
export const Public = () => SetMetadata(AUTH_MODE_KEY, 'public');
export const OptionalAuth = () => SetMetadata(AUTH_MODE_KEY, 'optional');