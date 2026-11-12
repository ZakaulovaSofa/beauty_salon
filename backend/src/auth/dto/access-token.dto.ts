import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  @ApiProperty({ description: 'JWT для заголовка Authorization: Bearer <token>' })
  access_token!: string;
}