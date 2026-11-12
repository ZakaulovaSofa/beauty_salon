import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';

import { User } from '../../users/models/user.model.js';
import { AUTH_MODE_KEY } from '../decorators/access.decorators.js';
import type { AuthMode } from '../decorators/access.decorators.js';
import type { AuthRequest } from '../decorators/current-user.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    @InjectModel(User) private readonly users: typeof User,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const mode = this.reflector.getAllAndOverride<AuthMode>(AUTH_MODE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (mode === 'public') {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authorization = request.headers.authorization;

    if (mode === 'optional' && authorization === undefined) {
      return true;
    }

    const token = authorization?.match(/^Bearer[ \t]+(\S+)$/i)?.[1];

    if (!token) {
      throw new UnauthorizedException('Требуется Bearer-токен');
    }

    let payload: { userId?: unknown; exp?: unknown };

    try {
      payload = await this.jwt.verifyAsync(token, { algorithms: ['HS256'] });
    } catch {
      throw new UnauthorizedException('Недействительный или просроченный токен');
    }

    const userId = payload?.userId;
    if (
      typeof userId !== 'number' ||
      !Number.isSafeInteger(userId) ||
      userId <= 0 ||
      typeof payload?.exp !== 'number'
    ) {
      throw new UnauthorizedException('Недействительный токен');
    }

    const user = await this.users.findByPk(userId, {
      attributes: ['id', 'role'],
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    request.user = { id: user.id, role: user.role };
    return true;
  }
}