import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { Role } from '../../common/enums/role.enum.js';

export interface AuthenticatedUser {
  id: number;
  role: Role;
}

export type AuthRequest = Request & { user?: AuthenticatedUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser | undefined =>
    context.switchToHttp().getRequest<AuthRequest>().user,
);