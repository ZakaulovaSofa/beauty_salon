import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import * as argon2 from 'argon2';
import { UniqueConstraintError } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { compare, truncates } from 'bcryptjs';

import { Role } from '../common/enums/role.enum.js';
import { User } from '../users/models/user.model.js';
import type { AccessTokenDto } from './dto/access-token.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AccessTokenDto> {
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    try {
      return await this.sequelize.transaction(async (transaction) => {
        const user = await this.users.create(
          {
            login: dto.login,
            firstName: dto.first_name,
            lastName: dto.last_name,
            passwordHash,
            role: Role.CLIENT,
          },
          { transaction },
        );

        const access_token = await this.jwt.signAsync({ userId: user.id });
        return { access_token };
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Логин уже занят');
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AccessTokenDto> {
    const user = await this.users.findOne({
      where: { login: dto.login },
      attributes: ['id', 'passwordHash'],
    });

    if (
      !user ||
      !(await argon2.verify(user.passwordHash, dto.password))
    ) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    return {
      access_token: await this.jwt.signAsync({ userId: user.id }),
    };
  }
}