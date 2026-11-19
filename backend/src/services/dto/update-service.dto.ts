
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsString,
    Max,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';

import { Status } from '../../common/enums/status.enum.js';

function Trim() {
    return Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim() : value,
    );
}

export class UpdateServiceDto {
    @ApiPropertyOptional({
        example: 'Женская стрижка',
        minLength: 1,
        maxLength: 255,
    })
    @ValidateIf((_object, value) => value !== undefined)
    @Trim()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        example: 'Стрижка и укладка',
        nullable: true,
    })
    @ValidateIf(
        (_object, value) => value !== undefined && value !== null,
    )
    @IsString()
    description?: string | null;

    @ApiPropertyOptional({
        example: 2000,
        minimum: 0,
    })
    @ValidateIf((_object, value) => value !== undefined)
    @IsInt()
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    price?: number;

    @ApiPropertyOptional({
        example: 90,
        minimum: 1,
    })
    @ValidateIf((_object, value) => value !== undefined)
    @IsInt()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    duration_minutes?: number;

    @ApiPropertyOptional({
        enum: Status,
        example: Status.INACTIVE,
    })
    @ValidateIf((_object, value) => value !== undefined)
    @IsEnum(Status)
    status?: Status;
}
