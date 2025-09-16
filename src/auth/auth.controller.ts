import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация по email + пароль' })
  @ApiResponse({ status: 201, description: 'Регистрация успешна', type: RegisterResponseDto })
  @ApiResponse({ status: 409, description: 'Пользователь уже существует' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход по email + пароль' })
  @ApiResponse({ status: 200, description: 'Успешный вход', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Неверный email или пароль' })
  @ApiResponse({ status: 403, description: 'Google-аккаунт. Войдите через Google' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Get('google')
  @ApiOperation({ summary: 'Редирект на Google OAuth (не работает из Swagger)' })
  @ApiResponse({ status: 302, description: 'Редирект на Google' })
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return { msg: 'redirecting to Google...' };
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Callback от Google после входа' })
  @ApiResponse({ status: 200, description: 'Токен пользователя после Google авторизации' })
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req) {
    return req.user;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление токена по refresh_token' })
  @ApiBody({
    schema: {
      example: {
        refreshToken: 'eyJhbGci...'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Обновление токена', type: RefreshResponseDto })
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выход, инвалидирует refresh_token' })
  @ApiBody({ schema: { example: { userId: 'uuid' } } })
  logout(@Body() body: { userId: string }) {
    return this.authService.logout(body.userId);
  }
}
