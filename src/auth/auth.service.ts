import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { MailService } from 'src/mail/mail.service';
import { RedisService } from 'src/redis/redis.service';
import { User } from 'src/users/entities/user.entity';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly redis: RedisService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mail: MailService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Пользователь с таким email не найден');
    }

    if (!user.password) {
      throw new ForbiddenException(
        'Этот аккаунт зарегистрирован через Google. Войдите через Google.'
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Неверный пароль');
    }

    return user;
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '15m'
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d'
    });

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashed);
  }

  async login(user: User) {
    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      ...tokens,
      user
    };
  }

  async register(email: string, password: string) {
    const exists = await this.usersService.findByEmail(email);

    if (exists) throw new ConflictException('Пользователь с таким email уже существует');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ email, password: hashed });

    return this.login(user);
  }

  async refresh(refreshToken: string) {
    const user = await this.usersService.findByRefreshToken(refreshToken);
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) throw new UnauthorizedException();

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.removeRefreshToken(userId);
  }

  async loginWithGoogle(profile: any) {
    const email = profile.emails[0].value;
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        email,
        googleId: profile.id
      });
    }

    return this.login(user);
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new NotFoundException('Пользователь не найден');

    const rawToken = crypto.randomBytes(32).toString('hex');

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    await this.mail.sendPasswordResetEmail(user.email, link);

    const client = this.redis.getClient();
    await client.setex(`reset:${rawToken}`, 60 * 1, user.id);

    return { message: 'Письмо отправлено' };
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    const client = this.redis.getClient();
    const userId = await client.get(`reset:${token}`);

    if (!userId) {
      throw new UnauthorizedException('Токен недействителен или истёк');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(userId, hashedPassword);

    await client.del(`reset:${token}`);

    const user = await this.usersService.findById(userId);

    if (user) {
      await this.mail.sendPasswordChangedEmail(user.email);
    }

    return { message: 'Пароль успешно обновлён' };
  }
}
