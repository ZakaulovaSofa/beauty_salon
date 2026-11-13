import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import type { ListUsersQueryDto } from './dto/list-users-query.dto.js';
import type { UserResponseDto } from './dto/user-response.dto.js';
import type { Role } from '../common/enums/role.enum.js';

import { User } from './models/user.model.js';

const USER_RESPONSE_ATTRIBUTES = [
    'id',
    'login',
    'firstName',
    'lastName',
    'role',
];

@Injectable()
export class UsersService {
    constructor(@InjectModel(User) private readonly users: typeof User) { }

    async findAll(query: ListUsersQueryDto): Promise<UserResponseDto[]> {
        const { role, limit = 20, offset = 0 } = query;

        const users = await this.users.findAll({
            attributes: USER_RESPONSE_ATTRIBUTES,
            where: role === undefined ? {} : { role },
            order: [['id', 'ASC']],
            limit,
            offset,
        });

        return users.map((user) => this.toResponse(user));
    }

    async findOne(id: number): Promise<UserResponseDto> {
        const user = await this.findUserOrThrow(id);
        return this.toResponse(user);
    }

    async updateRole(id: number, role: Role): Promise<UserResponseDto> {
        const user = await this.findUserOrThrow(id);

        await user.update({ role }, { fields: ['role'] });

        return this.toResponse(user);
    }

    private async findUserOrThrow(id: number): Promise<User> {
        const user = await this.users.findByPk(id, {
            attributes: USER_RESPONSE_ATTRIBUTES,
        });

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        return user;
    }

    private toResponse(user: User): UserResponseDto {
        return {
            id: user.id,
            login: user.login,
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role,
        };
    }
}