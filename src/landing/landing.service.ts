import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import { CreateLandingDto } from './dto/create-landing.dto';
import { Landing } from './entities/landing.entity';

@Injectable()
export class LandingService {
  constructor(@InjectRepository(Landing) private repo: Repository<Landing>) {}

  async create(user: User, dto: CreateLandingDto) {
    if (!user.activeTeam) throw new BadRequestException('У пользователя нет активной команды');

    const entity = this.repo.create({
      ...dto,
      creator: user,
      team: user.activeTeam,
      effects: dto.effects ?? {},
      sectors: dto.sectors ?? {},
      bonuses: (dto as any).bonuses ?? {},
      freeBet: (dto as any).freeBet ?? {},
      font: (dto as any).font ?? {}
    });

    return this.repo.save(entity);
  }

  async findByTeam(user: User) {
    if (!user.activeTeam) {
      throw new BadRequestException('У пользователя нет активной команды');
    }

    return this.repo.find({
      where: {
        team: { id: user.activeTeam.id }
      },
      relations: ['creator', 'team'],
      order: { createdAt: 'DESC' }
    });
  }

  findOne(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ['creator', 'team']
    });
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { success: true };
  }
}
