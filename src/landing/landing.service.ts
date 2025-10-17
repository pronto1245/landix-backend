import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { In, Repository } from 'typeorm';

import { CreateLandingDto } from './dto/create-landing.dto';
import { Landing } from './entities/landing.entity';

@Injectable()
export class LandingService {
  constructor(
    @InjectRepository(Landing) private repo: Repository<Landing>,
    @InjectRepository(User) private userRepo: Repository<User>
  ) {}

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

  async findByTeam(
    user: User,
    options?: {
      page?: number;
      limit?: number;
      name?: string;
      template?: string;
      creator?: string;
    }
  ) {
    if (!user.activeTeam) {
      throw new BadRequestException('У пользователя нет активной команды');
    }

    const { page = 1, limit = 20, name, template, creator } = options || {};

    const qb = this.repo
      .createQueryBuilder('landing')
      .leftJoinAndSelect('landing.creator', 'creator')
      .leftJoinAndSelect('landing.team', 'team')
      .where('team.id = :teamId', { teamId: user.activeTeam.id });

    if (name) {
      qb.andWhere('LOWER(landing.name) LIKE :name', {
        name: `%${name.toLowerCase()}%`
      });
    }

    if (template) {
      qb.andWhere('LOWER(landing.template) LIKE :template', {
        template: `%${template.toLowerCase()}%`
      });
    }

    if (creator) {
      qb.andWhere('creator.id = :creatorId', { creatorId: creator });
    }

    const total = await qb.getCount();

    const data = await qb
      .orderBy('landing.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data
    };
  }

  findOne(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ['creator', 'team']
    });
  }

  async update(user: User, id: string, dto: CreateLandingDto) {
    const landing = await this.findOne(id);

    if (!landing) throw new BadRequestException('Лендинг не найден');

    if (!landing.team || landing.team.id !== user.activeTeam?.id) {
      throw new ForbiddenException('Нет доступа к этому лендингу');
    }

    Object.assign(landing, {
      ...dto,
      effects: dto.effects ?? {},
      sectors: dto.sectors ?? {},
      bonuses: (dto as any).bonuses ?? {},
      freeBet: (dto as any).freeBet ?? {},
      font: (dto as any).font ?? {}
    });

    return this.repo.save(landing);
  }

  async transferToUser(currentUser: User, landingId: string, targetUserId: string) {
    const landing = await this.repo.findOne({
      where: { id: landingId },
      relations: ['creator', 'team']
    });

    if (!landing) throw new NotFoundException('Лендинг не найден');

    if (landing.team.id !== currentUser.activeTeam?.id) {
      throw new ForbiddenException('Нет доступа к этому лендингу');
    }

    const targetUser = await this.userRepo.findOne({
      where: { id: targetUserId },
      relations: ['teamMemberships', 'teamMemberships.team']
    });

    if (!targetUser) {
      throw new BadRequestException('Целевой пользователь не найден');
    }

    const isInSameTeam = targetUser.teamMemberships?.some(
      (member) => member.team.id === landing.team.id
    );

    if (!isInSameTeam) {
      throw new ForbiddenException('Пользователь не состоит в этой команде');
    }

    landing.creator = targetUser;
    await this.repo.save(landing);

    return { message: 'Лендинг передан другому пользователю' };
  }

  async duplicate(user: User, landingId: string, newName: string) {
    const original = await this.repo.findOne({
      where: { id: landingId },
      relations: ['team', 'creator']
    });

    if (!original) throw new NotFoundException('Оригинальный лендинг не найден');
    if (original.team.id !== user.activeTeam?.id) {
      throw new ForbiddenException('Нет доступа к этому лендингу');
    }

    const copy = this.repo.create({
      ...original,
      id: undefined,
      name: newName,
      creator: user,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return this.repo.save(copy);
  }

  async remove(user: User, id: string) {
    const landing = await this.findOne(id);

    if (!landing) throw new BadRequestException('Лендинг не найден');

    if (!landing.team || landing.team.id !== user.activeTeam?.id) {
      throw new ForbiddenException('Нет доступа к этому лендингу');
    }

    await this.repo.delete(id);
  }

  async removeMany(user: User, ids: string[]) {
    if (!ids?.length) throw new BadRequestException('Не переданы ID для удаления');

    const landings = await this.repo.find({
      where: { id: In(ids) },
      relations: ['team']
    });

    const forbidden = landings.some((l) => l.team.id !== user.activeTeam?.id);

    if (forbidden) {
      throw new ForbiddenException('Некоторые лендинги не принадлежат вашей команде');
    }

    await this.repo.delete(ids);

    return { deleted: ids.length };
  }
}
