import { ApiProperty } from '@nestjs/swagger';

import { Role } from '../../common/enums/role.enum.js';

export class UserResponseDto {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ example: 'anna_ivanova' })
  login!: string;

  @ApiProperty({ example: 'Анна' })
  first_name!: string;

  @ApiProperty({ example: 'Иванова' })
  last_name!: string;

  @ApiProperty({ enum: Role, example: Role.CLIENT })
  role!: Role;
}