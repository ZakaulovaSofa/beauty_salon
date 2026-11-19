
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';

import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Roles, OptionalAuth } from '../auth/decorators/access.decorators.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '../common/enums/role.enum.js';

import { ServicesService } from './services.service.js';

import { ListServicesQueryDto } from './dto/list-services-query.dto.js';
import { ServiceIdParamDto } from './dto/service-id-param.dto.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { ServiceResponseDto } from './dto/service-response.dto.js';

@ApiTags('Услуги')
@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) {}

    @Get()
    @OptionalAuth()
    @ApiOperation({ summary: 'Получить список услуг' })
    @ApiOkResponse({
        description: 'Список услуг получен',
        type: [ServiceResponseDto],
    })
    @ApiBadRequestResponse({
        description: 'Неверные фильтры или параметры запроса',
    })
    @ApiUnauthorizedResponse({
        description: 'Передан недействительный токен',
    })
    @ApiForbiddenResponse({
        description: 'Фильтр status доступен только администратору',
    })
    findAll(
        @Query() query: ListServicesQueryDto,
        @CurrentUser() user?: AuthenticatedUser,
    ): Promise<ServiceResponseDto[]> {
        return this.servicesService.findAll(query, user);
    }

    @Get(':id')
    @OptionalAuth()
    @ApiOperation({ summary: 'Получить карточку услуги' })
    @ApiParam({
        name: 'id',
        description: 'Идентификатор услуги',
        schema: { type: 'integer', minimum: 1, example: 1 },
    })
    @ApiOkResponse({
        description: 'Услуга найдена',
        type: ServiceResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Неверный id или переданы query-параметры',
    })
    @ApiUnauthorizedResponse({
        description: 'Передан недействительный токен',
    })
    @ApiNotFoundResponse({
        description: 'Услуга не найдена',
    })
    findOne(
        @Param() { id }: ServiceIdParamDto,
        @Query() query: Record<string, unknown>,
        @CurrentUser() user?: AuthenticatedUser,
    ): Promise<ServiceResponseDto> {
        if (Object.keys(query).length > 0) {
            throw new BadRequestException(
                'Параметры запроса не поддерживаются',
            );
        }

        return this.servicesService.findOne(id, user);
    }

    @Post()
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Создать услугу' })
    @ApiBody({ type: CreateServiceDto })
    @ApiCreatedResponse({
        description: 'Услуга создана',
        type: ServiceResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Неверное тело или параметры запроса',
    })
    @ApiUnauthorizedResponse({
        description: 'Ошибка аутентификации',
    })
    @ApiForbiddenResponse({
        description: 'Требуется роль администратора',
    })
    create(
        @Body() dto: CreateServiceDto,
        @Query() query: Record<string, unknown>,
    ): Promise<ServiceResponseDto> {
        if (Object.keys(query).length > 0) {
            throw new BadRequestException(
                'Параметры запроса не поддерживаются',
            );
        }

        return this.servicesService.create(dto);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Изменить услугу или её статус' })
    @ApiParam({
        name: 'id',
        description: 'Идентификатор услуги',
        schema: { type: 'integer', minimum: 1, example: 1 },
    })
    @ApiBody({ type: UpdateServiceDto })
    @ApiOkResponse({
        description: 'Услуга обновлена',
        type: ServiceResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Неверный id, JSON или параметры запроса',
    })
    @ApiUnauthorizedResponse({
        description: 'Ошибка аутентификации',
    })
    @ApiForbiddenResponse({
        description: 'Требуется роль администратора',
    })
    @ApiNotFoundResponse({
        description: 'Услуга не найдена',
    })
    update(
        @Param() { id }: ServiceIdParamDto,
        @Body() dto: UpdateServiceDto,
        @Query() query: Record<string, unknown>,
    ): Promise<ServiceResponseDto> {
        if (Object.keys(query).length > 0) {
            throw new BadRequestException(
                'Параметры запроса не поддерживаются',
            );
        }

        return this.servicesService.update(id, dto);
    }
}
