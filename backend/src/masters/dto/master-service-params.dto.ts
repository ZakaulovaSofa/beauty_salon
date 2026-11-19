
import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class MasterServiceParamsDto {
    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' && /^\d+$/.test(value)
            ? Number(value)
            : value,
    )
    @IsInt()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    id!: number;

    @Transform(({ value }: { value: unknown }) =>
        typeof value === 'string' && /^\d+$/.test(value)
            ? Number(value)
            : value,
    )
    @IsInt()
    @Min(1)
    @Max(Number.MAX_SAFE_INTEGER)
    service_id!: number;
}
