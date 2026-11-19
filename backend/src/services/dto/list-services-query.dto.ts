
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

import { Status } from '../../common/enums/status.enum.js';

const SERVICE_STATUS_FILTERS: (Status | 'all')[] = [
    ...Object.values(Status),
    'all',
];

export type ServiceStatusFilter = Status | 'all';

function ToQueryInteger() {
    return Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' && /^\d+$/.test(value)
            ? Number(value)
            : value,
    );
}

export class ListServicesQueryDto {
    @ApiPropertyOptional({
        type: 'integer',
        minimum: 1,
        description: 'Фильтр по идентификатору мастера',
        example: 4,
    })
    @IsOptional()
    @ToQueryInteger()
    @IsInt()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    master_id?: number;

    @ApiPropertyOptional({
        enum: SERVICE_STATUS_FILTERS,
        description: 'Фильтр по статусу услуги (только для администратора)',
    })
    @IsOptional()
    @IsIn(SERVICE_STATUS_FILTERS)
    status?: ServiceStatusFilter;
}
