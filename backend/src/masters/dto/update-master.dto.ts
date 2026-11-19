
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsString,
    Max,
    Min,
    ValidateIf,
} from 'class-validator';

import { Status } from '../../common/enums/status.enum.js';

export class UpdateMasterDto {
    @ApiPropertyOptional({
        example: 6,
        minimum: 0,
        description: 'Стаж мастера в полных годах',
    })
    @ValidateIf((_object, value) => value !== undefined)
    @IsInt()
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    experience?: number;

    @ApiPropertyOptional({
        example: 'Парикмахер-стилист',
        nullable: true,
    })
    @ValidateIf(
        (_object, value) => value !== undefined && value !== null,
    )
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    description?: string | null;

    @ApiPropertyOptional({
        enum: Status,
        example: Status.INACTIVE,
        description: 'Статус профиля мастера',
    })
    @ValidateIf((_object, value) => value !== undefined)
    @IsEnum(Status)
    status?: Status;
}
