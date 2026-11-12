import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { Role } from '../../common/enums/role.enum.js';
import { ROLES_KEY } from '../decorators/access.decorators.js';
import type { AuthRequest } from '../decorators/current-user.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthRequest>();

    if (!user) {
      throw new UnauthorizedException('Требуется аутентификация');
    }

    return roles.includes(user.role);
  }
}