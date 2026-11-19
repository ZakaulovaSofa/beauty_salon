
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsIn,
    IsInt,
    IsOptional,
    Max,
    Min,
} from 'class-validator';

import { Status } from '../../common/enums/status.enum.js';

const MASTER_STATUS_FILTERS: (Status | 'all')[] = [
    ...Object.values(Status),
    'all',
];

export type MasterStatusFilter = Status | 'all';

function ToQueryInteger() {
    return Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' && /^\d+$/.test(value)
            ? Number(value)
            : value,
    );
}

export class ListMastersQueryDto {
    @ApiPropertyOptional({
        type: 'integer',
        minimum: 1,
        description: 'Фильтр по идентификатору услуги',
        example: 1,
    })
    @IsOptional()
    @ToQueryInteger()
    @IsInt()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    service_id?: number;

    @ApiPropertyOptional({
        enum: MASTER_STATUS_FILTERS,
        description: 'Фильтр по статусу мастера (только для администратора)',
    })
    @IsOptional()
    @IsIn(MASTER_STATUS_FILTERS)
    status?: MasterStatusFilter;

    @ApiPropertyOptional({
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
    })
    @IsOptional()
    @ToQueryInteger()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @ApiPropertyOptional({
        type: 'integer',
        minimum: 0,
        default: 0,
        description: 'Сколько мастеров пропустить',
    })
    @IsOptional()
    @ToQueryInteger()
    @IsInt()
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    offset?: number;
}
