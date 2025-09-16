import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateLandingDto } from './dto/create-landing.dto';
import { Landing } from './entities/landing.entity';

@Injectable()
export class LandingService {
  constructor(@InjectRepository(Landing) private repo: Repository<Landing>) {}

  create(dto: CreateLandingDto) {
    const entity = this.repo.create({
      ...dto,
      locale: dto.locale ?? 'en',
      spins: dto.spins ?? 1,
      sectors: dto.sectors ?? {},
      effects: dto.effects ?? {},
      extra: dto.extra ?? {}
    });
    return this.repo.save(entity);
  }

  findOne(id: string) {
    return this.repo.findOneBy({ id });
  }
  findAll() {
    return this.repo.find();
  }

  update(id: string, patch: Partial<CreateLandingDto>) {
    return this.repo.save({ id, ...patch });
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
