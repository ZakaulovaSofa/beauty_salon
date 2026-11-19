
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';

import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
    OptionalAuth,
    Roles,
} from '../auth/decorators/access.decorators.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '../common/enums/role.enum.js';

import { MastersService } from './masters.service.js';

import { ListMastersQueryDto } from './dto/list-masters-query.dto.js';
import { MasterIdParamDto } from './dto/master-id-param.dto.js';
import { MasterServiceParamsDto } from './dto/master-service-params.dto.js';
import { CreateMasterDto } from './dto/create-master.dto.js';
import { UpdateMasterDto } from './dto/update-master.dto.js';
import { MasterResponseDto } from './dto/master-response.dto.js';
import { SetMasterServiceStatusDto } from './dto/set-master-service-status.dto.js';
import { MasterServiceResponseDto } from './dto/master-service-response.dto.js';
import { MasterServiceLinkResponseDto } from './dto/master-service-link-response.dto.js';

@ApiTags('Мастера')
@Controller('masters')
export class MastersController {
    constructor(private readonly mastersService: MastersService) {}

    @Get()
    @OptionalAuth()
    @ApiOperation({ summary: 'Получить список мастеров' })
    @ApiOkResponse({
        description: 'Список мастеров получен',
        type: [MasterResponseDto],
    })
    @ApiBadRequestResponse({
        description: 'Неверные фильтры или параметры пагинации',
    })
    @ApiUnauthorizedResponse({
        description: 'Передан недействительный токен',
    })
    @ApiForbiddenResponse({
        description: 'Фильтр status доступен только администратору',
    })
    findAll(
        @Query() query: ListMastersQueryDto,
        @CurrentUser() user?: AuthenticatedUser,
    ): Promise<MasterResponseDto[]> {
        return this.mastersService.findAll(query, user);
    }

    @Get(':id')
    @OptionalAuth()
    @ApiOperation({ summary: 'Получить карточку мастера' })
    @ApiParam({
        name: 'id',
        description: 'Идентификатор профиля мастера',
        schema: { type: 'integer', minimum: 1, example: 1 },
    })
    @ApiOkResponse({
        description: 'Карточка мастера получена',
        type: MasterResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Неверный id или переданы query-параметры',
    })
    @ApiUnauthorizedResponse({
        description: 'Передан недействительный токен',
    })
    @ApiNotFoundResponse({
        description: 'Профиль отсутствует или скрыт из публичного каталога',
    })
    findOne(
        @Param() { id }: MasterIdParamDto,
        @Query() query: Record<string, unknown>,
        @CurrentUser() user?: AuthenticatedUser,
    ): Promise<MasterResponseDto> {
        if (Object.keys(query).length > 0) {
            throw new BadRequestException(
                'Параметры запроса не поддерживаются',
            );
        }

        return this.mastersService.findOne(id, user);
    }

    @Post()
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Создать профиль мастера' })
    @ApiBody({ type: CreateMasterDto })
    @ApiCreatedResponse({
        description: 'Профиль мастера создан',
        type: MasterResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Неверное тело или параметры запроса',
    })
    @ApiUnauthorizedResponse({ description: 'Ошибка аутентификации' })
    @ApiForbiddenResponse({
        description: 'Требуется роль администратора',
    })
    @ApiNotFoundResponse({
        description: 'Учётная запись не найдена',
    })
    @ApiConflictResponse({
        description: 'Другая роль пользователя или профиль уже существует',
    })
    create(
        @Body() dto: CreateMasterDto,
        @Query() query: Record<string, unknown>,
    ): Promise<MasterResponseDto> {
        if (Object.keys(query).length > 0) {
            throw new BadRequestException(
                'Параметры запроса не поддерживаются',
            );
        }

        return this.mastersService.create(dto);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Изменить профиль или статус мастера',
    })
    @ApiParam({
        name: 'id',
        description: 'Идентификатор профиля мастера',
        schema: { type: 'integer', minimum: 1, example: 1 },
    })
    @ApiBody({ type: UpdateMasterDto })
    @ApiOkResponse({
        description: 'Профиль мастера обновлён',
        type: MasterResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Неверный id, JSON или параметры запроса',
    })
    @ApiUnauthorizedResponse({ description: 'Ошибка аутентификации' })
    @ApiForbiddenResponse({
        description: 'Требуется роль администратора',
    })
    @ApiNotFoundResponse({ description: 'Профиль мастера не найден' })
    update(
        @Param() { id }: MasterIdParamDto,
        @Body() dto: UpdateMasterDto,
        @Query() query: Record<string, unknown>,
    ): Promise<MasterResponseDto> {
        if (Object.keys(query).length > 0) {
            throw new BadRequestException(
                'Параметры запроса не поддерживаются',
            );
        }

        return this.mastersService.update(id, dto);
    }

    @Get(':id/services')
    @OptionalAuth()
    @ApiOperation({ summary: 'Получить услуги мастера' })
    @ApiParam({
        name: 'id',
        description: 'Идентификатор профиля мастера',
        schema: { type: 'integer', minimum: 1, example: 1 },
    })
    @ApiOkResponse({
        description: 'Список услуг получен',
        type: [MasterServiceResponseDto],
    })
    @ApiBadRequestResponse({
        description: 'Неверный id или переданы query-параметры',
    })
    @ApiUnauthorizedResponse({
        description: 'Передан недействительный токен',
    })
    @ApiNotFoundResponse({
        description: 'Профиль мастера не найден или скрыт',
    })
    findServices(
        @Param() { id }: MasterIdParamDto,
        @Query() query: Record<string, unknown>,
        @CurrentUser() user?: AuthenticatedUser,
    ): Promise<MasterServiceResponseDto[]> {
        if (Object.keys(query).length > 0) {
            throw new BadRequestException(
                'Параметры запроса не поддерживаются',
            );
        }

        return this.mastersService.findServices(id, user);
    }

    @Put(':id/services/:service_id')
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Назначить услугу мастеру или изменить статус связи',
    })
    @ApiParam({
        name: 'id',
        description: 'Идентификатор профиля мастера',
        schema: { type: 'integer', minimum: 1, example: 1 },
    })
    @ApiParam({
        name: 'service_id',
        description: 'Идентификатор услуги',
        schema: { type: 'integer', minimum: 1, example: 1 },
    })
    @ApiBody({ type: SetMasterServiceStatusDto })
    @ApiCreatedResponse({
        description: 'Связь мастера и услуги создана',
        type: MasterServiceLinkResponseDto,
    })
    @ApiOkResponse({
        description: 'Статус существующей связи изменён',
        type: MasterServiceLinkResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Неверные идентификаторы, JSON или параметры запроса',
    })
    @ApiUnauthorizedResponse({ description: 'Ошибка аутентификации' })
    @ApiForbiddenResponse({
        description: 'Требуется роль администратора',
    })
    @ApiNotFoundResponse({
        description: 'Мастер или услуга не найдены',
    })
    async setServiceStatus(
        @Param() params: MasterServiceParamsDto,
        @Body() dto: SetMasterServiceStatusDto,
        @Query() query: Record<string, unknown>,
        @Res({ passthrough: true }) response: Response,
    ): Promise<MasterServiceLinkResponseDto> {
        if (Object.keys(query).length > 0) {
            throw new BadRequestException(
                'Параметры запроса не поддерживаются',
            );
        }

        const result = await this.mastersService.setServiceStatus(
            params.id,
            params.service_id,
            dto.status,
        );

        response.status(
            result.created ? HttpStatus.CREATED : HttpStatus.OK,
        );

        return result.data;
    }
}
