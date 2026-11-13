import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

import { Role } from '../../common/enums/role.enum.js';

function ToQueryInteger() {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value,
  );
}

export class ListUsersQueryDto {
  @ApiPropertyOptional({ enum: Role, description: 'Фильтр по роли' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ type: 'integer', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @ToQueryInteger()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    type: 'integer',
    minimum: 0,
    maximum: Number.MAX_SAFE_INTEGER,
    default: 0,
    description: 'Сколько пользователей пропустить',
  })
  @IsOptional()
  @ToQueryInteger()
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  offset?: number;
}