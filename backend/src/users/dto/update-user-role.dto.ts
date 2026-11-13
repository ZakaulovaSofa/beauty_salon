import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum } from 'class-validator';

import { Role } from '../../common/enums/role.enum.js';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: Role,
    example: Role.MASTER,
    description: 'Новая роль пользователя',
  })
  @IsDefined()
  @IsEnum(Role)
  role!: Role;
}