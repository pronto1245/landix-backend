import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
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
}
