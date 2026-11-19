
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, UniqueConstraintError } from 'sequelize';

import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { Status } from '../common/enums/status.enum.js';

import { User } from '../users/models/user.model.js';
import { Service } from '../services/models/service.model.js';

import { Master } from './models/master.model.js';
import { MasterService } from './models/master-service.model.js';

import type { ListMastersQueryDto } from './dto/list-masters-query.dto.js';
import type { CreateMasterDto } from './dto/create-master.dto.js';
import type { UpdateMasterDto } from './dto/update-master.dto.js';
import type { MasterResponseDto } from './dto/master-response.dto.js';
import type { MasterServiceResponseDto } from './dto/master-service-response.dto.js';
import type { MasterServiceLinkResponseDto } from './dto/master-service-link-response.dto.js';

const MASTER_RESPONSE_ATTRIBUTES = [
    'id',
    'userId',
    'experience',
    'description',
    'photoUrl',
    'status',
];

const SERVICE_RESPONSE_ATTRIBUTES = [
    'id',
    'name',
    'description',
    'price',
    'durationMinutes',
    'status',
];

const MASTER_LINK_ATTRIBUTES = [
    'id',
    'masterId',
    'serviceId',
    'status',
];

@Injectable()
export class MastersService {
    constructor(
        @InjectModel(Master)
        private readonly masters: typeof Master,

        @InjectModel(MasterService)
        private readonly masterServices: typeof MasterService,

        @InjectModel(User)
        private readonly users: typeof User,

        @InjectModel(Service)
        private readonly services: typeof Service,
    ) {}

    // Получение списка мастеров с фильтрами и пагинацией.
    async findAll(
        query: ListMastersQueryDto,
        user?: AuthenticatedUser,
    ): Promise<MasterResponseDto[]> {
        const {
            service_id,
            status,
            limit = 20,
            offset = 0,
        } = query;

        const isAdmin = user?.role === Role.ADMIN;

        if (status !== undefined && !isAdmin) {
            throw new ForbiddenException(
                'Фильтр по статусу доступен только администратору',
            );
        }

        const effectiveStatus = status ?? Status.ACTIVE;

        let masterIds: number[] | undefined;

        // Фильтрация по услуге.
        if (service_id !== undefined) {
            if (!isAdmin) {
                const service = await this.services.findByPk(service_id, {
                    attributes: ['id', 'status'],
                });

                if (!service || service.status !== Status.ACTIVE) {
                    return [];
                }
            }

            const links = await this.masterServices.findAll({
                attributes: ['masterId'],
                where: {
                    serviceId: service_id,
                    ...(isAdmin ? {} : { status: Status.ACTIVE }),
                },
            });

            masterIds = links.map((link) => link.masterId);

            if (masterIds.length === 0) {
                return [];
            }
        }

        const where = {
            ...(effectiveStatus === 'all'
                ? {}
                : { status: effectiveStatus }),
            ...(masterIds === undefined
                ? {}
                : { id: { [Op.in]: masterIds } }),
        };

        const masters = await this.masters.findAll({
            attributes: MASTER_RESPONSE_ATTRIBUTES,
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName'],
                    required: true,
                    ...(isAdmin ? {} : {
                        where: { role: Role.MASTER },
                    }),
                },
            ],
            order: [['id', 'ASC']],
            limit,
            offset,
        });

        return masters.map((master) => this.toResponse(master));
    }

    // Получение карточки мастера.
    async findOne(
        id: number,
        user?: AuthenticatedUser,
    ): Promise<MasterResponseDto> {
        const master = await this.findMasterOrThrow(id);

        if (
            user?.role !== Role.ADMIN &&
            (
                master.status !== Status.ACTIVE ||
                master.user.role !== Role.MASTER
            )
        ) {
            throw new NotFoundException('Мастер не найден');
        }

        return this.toResponse(master);
    }

    // Создание профиля мастера.
    async create(
        dto: CreateMasterDto,
    ): Promise<MasterResponseDto> {
        const user = await this.users.findByPk(dto.user_id, {
            attributes: ['id', 'role'],
        });

        if (!user) {
            throw new NotFoundException('Учётная запись не найдена');
        }

        if (user.role !== Role.MASTER) {
            throw new ConflictException(
                'У пользователя должна быть роль master',
            );
        }

        const existingMaster = await this.masters.findOne({
            where: { userId: dto.user_id },
            attributes: ['id'],
        });

        if (existingMaster) {
            throw new ConflictException(
                'У пользователя уже существует профиль мастера',
            );
        }

        let master: Master;

        try {
            master = await this.masters.create({
                userId: dto.user_id,
                experience: dto.experience,
                description: dto.description ?? null,
                photoUrl: null,
                status: Status.ACTIVE,
            });
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new ConflictException(
                    'У пользователя уже существует профиль мастера',
                );
            }

            throw error;
        }

        const createdMaster = await this.findMasterOrThrow(master.id);

        return this.toResponse(createdMaster);
    }

    // Изменение профиля или статуса мастера.
    async update(
        id: number,
        dto: UpdateMasterDto,
    ): Promise<MasterResponseDto> {
        const master = await this.findMasterOrThrow(id);

        const updates: {
            experience?: number;
            description?: string | null;
            status?: Status;
        } = {};

        if (dto.experience !== undefined) {
            updates.experience = dto.experience;
        }

        if (dto.description !== undefined) {
            updates.description = dto.description;
        }

        if (dto.status !== undefined) {
            updates.status = dto.status;
        }

        if (Object.keys(updates).length === 0) {
            throw new BadRequestException(
                'Необходимо передать хотя бы одно поле для изменения',
            );
        }

        await master.update(updates, {
            fields: Object.keys(updates),
        });

        const updatedMaster = await this.findMasterOrThrow(id);

        return this.toResponse(updatedMaster);
    }

    // Получение услуг конкретного мастера.
    async findServices(
        masterId: number,
        user?: AuthenticatedUser,
    ): Promise<MasterServiceResponseDto[]> {
        const master = await this.findMasterOrThrow(masterId);
        const isAdmin = user?.role === Role.ADMIN;

        if (
            !isAdmin &&
            (
                master.status !== Status.ACTIVE ||
                master.user.role !== Role.MASTER
            )
        ) {
            throw new NotFoundException('Мастер не найден');
        }

        const links = await this.masterServices.findAll({
            attributes: MASTER_LINK_ATTRIBUTES,
            where: {
                masterId,
                ...(isAdmin ? {} : { status: Status.ACTIVE }),
            },
            include: [
                {
                    model: Service,
                    as: 'service',
                    attributes: SERVICE_RESPONSE_ATTRIBUTES,
                    required: true,
                    ...(isAdmin ? {} : {
                        where: { status: Status.ACTIVE },
                    }),
                },
            ],
            order: [['id', 'ASC']],
        });

        return links.map((link) => this.toMasterServiceResponse(link));
    }

    // Назначение услуги мастеру или изменение статуса связи.
    async setServiceStatus(
        masterId: number,
        serviceId: number,
        status: Status,
    ): Promise<{
        data: MasterServiceLinkResponseDto;
        created: boolean;
    }> {
        const master = await this.masters.findByPk(masterId, {
            attributes: ['id'],
        });

        if (!master) {
            throw new NotFoundException('Мастер не найден');
        }

        const service = await this.services.findByPk(serviceId, {
            attributes: ['id'],
        });

        if (!service) {
            throw new NotFoundException('Услуга не найдена');
        }

        const existingLink = await this.masterServices.findOne({
            where: {
                masterId,
                serviceId,
            },
        });

        if (existingLink) {
            await existingLink.update(
                { status },
                { fields: ['status'] },
            );

            return {
                data: this.toMasterServiceLinkResponse(existingLink),
                created: false,
            };
        }

        try {
            const link = await this.masterServices.create({
                masterId,
                serviceId,
                status,
            });

            return {
                data: this.toMasterServiceLinkResponse(link),
                created: true,
            };
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const link = await this.masterServices.findOne({
                    where: {
                        masterId,
                        serviceId,
                    },
                });

                if (link) {
                    await link.update(
                        { status },
                        { fields: ['status'] },
                    );

                    return {
                        data: this.toMasterServiceLinkResponse(link),
                        created: false,
                    };
                }
            }

            throw error;
        }
    }

    // Поиск профиля мастера с данными пользователя.
    private async findMasterOrThrow(id: number): Promise<Master> {
        const master = await this.masters.findByPk(id, {
            attributes: MASTER_RESPONSE_ATTRIBUTES,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'role'],
                    required: true,
                },
            ],
        });

        if (!master) {
            throw new NotFoundException('Мастер не найден');
        }

        return master;
    }

    // Преобразование профиля в формат API.
    private toResponse(master: Master): MasterResponseDto {
        return {
            id: master.id,
            first_name: master.user.firstName,
            last_name: master.user.lastName,
            experience: master.experience,
            description: master.description,
            photo_url: master.photoUrl,
            status: master.status,
        };
    }

    // Преобразование связи для ответа PUT.
    private toMasterServiceLinkResponse(
        link: MasterService,
    ): MasterServiceLinkResponseDto {
        return {
            id: link.id,
            master_id: link.masterId,
            service_id: link.serviceId,
            status: link.status,
        };
    }

    
private toMasterServiceResponse(
    link: MasterService,
): MasterServiceResponseDto {
    return {
        id: link.id,
        master_id: link.masterId,
        service_id: link.serviceId,
        status: link.status,
        service: {
            id: link.service.id,
            name: link.service.name,
            description: link.service.description,
            price: link.service.price,
            duration_minutes: link.service.durationMinutes,
            status: link.service.status,
        },
    };
}

}
