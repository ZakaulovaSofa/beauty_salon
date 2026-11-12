import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

function Trim() {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

export class RegisterDto {
  @ApiProperty({ example: 'Анна', minLength: 1, maxLength: 100 })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name!: string;

  @ApiProperty({ example: 'Иванова', minLength: 1, maxLength: 100 })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name!: string;

  @ApiProperty({ example: 'anna_ivanova', minLength: 1, maxLength: 100 })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  login!: string;

  @ApiProperty({
    example: 'ExamplePassword123!',
    format: 'password',
    minLength: 1,
    writeOnly: true,
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}