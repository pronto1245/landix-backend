import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordResetConfirmDto, PasswordResetRequestDto } from './dto/reset-password.dto';

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

  @Post('password-reset/request')
  @ApiOperation({ summary: 'Запрос восстановления пароля' })
  @ApiResponse({
    status: 200,
    description:
      'Если email существует, на него будет отправлено письмо со ссылкой для восстановления.'
  })
  @ApiBody({ type: PasswordResetRequestDto })
  async requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return await this.authService.requestPasswordReset(dto.email);
  }

  @Post('password-reset/confirm')
  @ApiOperation({ summary: 'Подтверждение восстановления пароля' })
  @ApiResponse({
    status: 200,
    description: 'Пароль успешно обновлён.'
  })
  @ApiResponse({
    status: 400,
    description: 'Токен недействителен или истёк.'
  })
  @ApiBody({ type: PasswordResetConfirmDto })
  async confirmPasswordReset(@Body() dto: PasswordResetConfirmDto) {
    return await this.authService.confirmPasswordReset(dto.token, dto.newPassword);
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
  async googleAuth() {}

  @Get('google/callback')
  @ApiOperation({ summary: 'Callback от Google после входа' })
  @ApiResponse({ status: 200, description: 'Токен пользователя после Google авторизации' })
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    const tokens = req.user;

    return res.redirect(
      `${process.env.FRONTEND_URL}/?access=${tokens.accessToken}&refresh=${tokens.refreshToken}`
    );
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Выход, инвалидирует refresh_token' })
  logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }
}
