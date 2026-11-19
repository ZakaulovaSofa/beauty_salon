
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import type { WhereOptions } from 'sequelize';

import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { Status } from '../common/enums/status.enum.js';

import { Master } from '../masters/models/master.model.js';
import { MasterService } from '../masters/models/master-service.model.js';
import { User } from '../users/models/user.model.js';

import type { ListServicesQueryDto } from './dto/list-services-query.dto.js';
import type { CreateServiceDto } from './dto/create-service.dto.js';
import type { UpdateServiceDto } from './dto/update-service.dto.js';
import type { ServiceResponseDto } from './dto/service-response.dto.js';

import { Service } from './models/service.model.js';

const SERVICE_RESPONSE_ATTRIBUTES = [
    'id',
    'name',
    'description',
    'price',
    'durationMinutes',
    'status',
];

@Injectable()
export class ServicesService {
    constructor(
        @InjectModel(Service)
        private readonly services: typeof Service,

        @InjectModel(Master)
        private readonly masters: typeof Master,

        @InjectModel(MasterService)
        private readonly masterServices: typeof MasterService,
    ) {}

    async findAll(
        query: ListServicesQueryDto,
        user?: AuthenticatedUser,
    ): Promise<ServiceResponseDto[]> {
        const { master_id, status } = query;
        const isAdmin = user?.role === Role.ADMIN;

        if (status !== undefined && !isAdmin) {
            throw new ForbiddenException(
                'Фильтр по статусу доступен только администратору',
            );
        }

        const where: WhereOptions = {};

        const effectiveStatus = status ?? Status.ACTIVE;

        if (effectiveStatus !== 'all') {
            where.status = effectiveStatus;
        }

        if (master_id !== undefined) {
            if (!isAdmin) {
                const master = await this.masters.findOne({
                    where: {
                        id: master_id,
                        status: Status.ACTIVE,
                    },
                    attributes: ['id'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: [],
                            required: true,
                            where: {
                                role: Role.MASTER,
                            },
                        },
                    ],
                });

                if (!master) {
                    return [];
                }
            }

            const links = await this.masterServices.findAll({
                attributes: ['serviceId'],
                where: {
                    masterId: master_id,
                    ...(isAdmin ? {} : { status: Status.ACTIVE }),
                },
            });

            const serviceIds = links.map((link) => link.serviceId);

            if (serviceIds.length === 0) {
                return [];
            }

            where.id = {
                [Op.in]: serviceIds,
            };
        }

        const services = await this.services.findAll({
            attributes: SERVICE_RESPONSE_ATTRIBUTES,
            where,
            order: [['id', 'ASC']],
        });

        return services.map((service) => this.toResponse(service));
    }

    async findOne(
        id: number,
        user?: AuthenticatedUser,
    ): Promise<ServiceResponseDto> {
        const service = await this.findServiceOrThrow(id);

        if (
            user?.role !== Role.ADMIN &&
            service.status !== Status.ACTIVE
        ) {
            throw new NotFoundException('Услуга не найдена');
        }

        return this.toResponse(service);
    }

    async create(
        dto: CreateServiceDto,
    ): Promise<ServiceResponseDto> {
        const service = await this.services.create({
            name: dto.name,
            description: dto.description ?? null,
            price: dto.price,
            durationMinutes: dto.duration_minutes,
            status: Status.ACTIVE,
        });

        return this.toResponse(service);
    }

    async update(
        id: number,
        dto: UpdateServiceDto,
    ): Promise<ServiceResponseDto> {
        const service = await this.findServiceOrThrow(id);

        const updates: {
            name?: string;
            description?: string | null;
            price?: number;
            durationMinutes?: number;
            status?: Status;
        } = {};

        if (dto.name !== undefined) {
            updates.name = dto.name;
        }

        if (dto.description !== undefined) {
            updates.description = dto.description;
        }

        if (dto.price !== undefined) {
            updates.price = dto.price;
        }

        if (dto.duration_minutes !== undefined) {
            updates.durationMinutes = dto.duration_minutes;
        }

        if (dto.status !== undefined) {
            updates.status = dto.status;
        }

        if (Object.keys(updates).length === 0) {
            throw new BadRequestException(
                'Необходимо передать хотя бы одно поле для изменения',
            );
        }

        await service.update(updates, {
            fields: Object.keys(updates),
        });

        return this.toResponse(service);
    }

    private async findServiceOrThrow(id: number): Promise<Service> {
        const service = await this.services.findByPk(id, {
            attributes: SERVICE_RESPONSE_ATTRIBUTES,
        });

        if (!service) {
            throw new NotFoundException('Услуга не найдена');
        }

        return service;
    }

    private toResponse(service: Service): ServiceResponseDto {
        return {
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            duration_minutes: service.durationMinutes,
            status: service.status,
        };
    }
}
