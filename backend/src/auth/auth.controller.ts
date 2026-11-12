import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from './decorators/access.decorators.js';

import { AuthService } from './auth.service.js';
import { AccessTokenDto } from './dto/access-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Зарегистрировать клиента' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ description: 'Клиент создан', type: AccessTokenDto })
  @ApiBadRequestResponse({ description: 'Некорректное тело или параметры запроса' })
  @ApiConflictResponse({ description: 'Логин уже занят' })
  register(
    @Body() dto: RegisterDto,
    @Query() query: Record<string, unknown>,
  ): Promise<AccessTokenDto> {
    if (Object.keys(query).length > 0) {
      throw new BadRequestException('Параметры запроса не поддерживаются');
    }

    return this.auth.register(dto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Войти в систему' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Токен выдан', type: AccessTokenDto })
  @ApiBadRequestResponse({ description: 'Некорректное тело или параметры запроса' })
  @ApiUnauthorizedResponse({ description: 'Неверный логин или пароль' })
  login(
    @Body() dto: LoginDto,
    @Query() query: Record<string, unknown>,
  ): Promise<AccessTokenDto> {
    if (Object.keys(query).length > 0) {
      throw new BadRequestException('Параметры запроса не поддерживаются');
    }

    return this.auth.login(dto);
  }
}