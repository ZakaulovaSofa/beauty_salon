import { Controller, Get, Query, BadRequestException, Param, Body, Patch } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiBody,
} from '@nestjs/swagger';

import { Roles } from '../auth/decorators/access.decorators.js';
import { Role } from '../common/enums/role.enum.js';
import { ListUsersQueryDto } from './dto/list-users-query.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UserIdParamDto } from './dto/user-id-param.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получить список пользователей' })
    @ApiOkResponse({ description: 'Список получен', type: [UserResponseDto] })
    @ApiBadRequestResponse({ description: 'Неверные фильтры или пагинация' })
    @ApiUnauthorizedResponse({ description: 'Ошибка аутентификации' })
    @ApiForbiddenResponse({ description: 'Требуется роль администратора' })
    findAll(@Query() query: ListUsersQueryDto): Promise<UserResponseDto[]> {
        return this.usersService.findAll(query);
    }

    @Get(':id')
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получить пользователя по id' })
    @ApiParam({
        name: 'id',
        description: 'Идентификатор пользователя',
        schema: { type: 'integer', minimum: 1, example: 12 },
    })
    @ApiOkResponse({ description: 'Пользователь найден', type: UserResponseDto })
    @ApiBadRequestResponse({ description: 'Неверный id или переданы query-параметры' })
    @ApiUnauthorizedResponse({ description: 'Ошибка аутентификации' })
    @ApiForbiddenResponse({ description: 'Требуется роль администратора' })
    @ApiNotFoundResponse({ description: 'Пользователь не найден' })
    findOne(
        @Param() { id }: UserIdParamDto,
        @Query() query: Record<string, unknown>,
    ): Promise<UserResponseDto> {
        if (Object.keys(query).length > 0) {
            throw new BadRequestException('Параметры запроса не поддерживаются');
        }

        return this.usersService.findOne(id);
    }

    @Patch(':id/role')
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Изменить роль пользователя' })
    @ApiParam({
        name: 'id',
        description: 'Идентификатор пользователя',
        schema: { type: 'integer', minimum: 1, example: 27 },
    })
    @ApiBody({ type: UpdateUserRoleDto })
    @ApiOkResponse({ description: 'Роль установлена', type: UserResponseDto })
    @ApiBadRequestResponse({
        description: 'Неверный id, JSON или переданы query-параметры',
    })
    @ApiUnauthorizedResponse({ description: 'Ошибка аутентификации' })
    @ApiForbiddenResponse({ description: 'Требуется роль администратора' })
    @ApiNotFoundResponse({ description: 'Пользователь не найден' })
    updateRole(
        @Param() { id }: UserIdParamDto,
        @Body() dto: UpdateUserRoleDto,
        @Query() query: Record<string, unknown>,
    ): Promise<UserResponseDto> {
        if (Object.keys(query).length > 0) {
            throw new BadRequestException('Параметры запроса не поддерживаются');
        }

        return this.usersService.updateRole(id, dto.role);
    }
}