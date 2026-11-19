
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsDefined,
    IsInt,
    IsNotEmpty,
    IsString,
    Max,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';

function Trim() {
    return Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' ? value.trim() : value,
    );
}

export class CreateServiceDto {
    @ApiProperty({
        example: 'Женская стрижка',
        minLength: 1,
        maxLength: 255,
    })
    @Trim()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name!: string;

    @ApiPropertyOptional({
        example: 'Стрижка и укладка',
        nullable: true,
    })
    @ValidateIf(
        (_object, value) => value !== undefined && value !== null,
    )
    @IsString()
    description?: string | null;

    @ApiProperty({
        example: 1500,
        minimum: 0,
    })
    @IsDefined()
    @IsInt()
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    price!: number;

    @ApiProperty({
        example: 60,
        minimum: 1,
    })
    @IsDefined()
    @IsInt()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    duration_minutes!: number;
}
