
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsDefined,
    IsInt,
    IsString,
    Max,
    Min,
    ValidateIf,
} from 'class-validator';

export class CreateMasterDto {
    @ApiProperty({
        example: 2,
        minimum: 1,
        description: 'Идентификатор учётной записи мастера',
    })
    @IsDefined()
    @IsInt()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    user_id!: number;

    @ApiProperty({
        example: 5,
        minimum: 0,
        description: 'Стаж мастера в полных годах',
    })
    @IsDefined()
    @IsInt()
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    experience!: number;

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
}
