import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>
  ) {}

  findAll() {
    return this.usersRepo.find();
  }

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  create(userData: Partial<User>) {
    const user = this.usersRepo.create(userData);
    return this.usersRepo.save(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.usersRepo.update(userId, { refreshToken });
  }

  async removeRefreshToken(userId: string) {
    await this.usersRepo.update(userId, { refreshToken: null });
  }

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const users = await this.usersRepo.find();
    for (const user of users) {
      if (user.refreshToken) {
        const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
        if (isMatch) return user;
      }
    }
    return null;
  }
}
