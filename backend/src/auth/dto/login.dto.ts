import { PickType } from '@nestjs/swagger';

import { RegisterDto } from './register.dto.js';

export class LoginDto extends PickType(RegisterDto, [
  'login',
  'password',
] as const) {}