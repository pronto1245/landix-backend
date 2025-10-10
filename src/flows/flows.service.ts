import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Domain } from 'src/domains/entities/domain.entity';
import { FacebookPixel } from 'src/facebook/entities/facebook-pixel.entity';
import { Landing } from 'src/landing/entities/landing.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import { CreateFlowDto } from './dto/create-flow.dto';
import { Flow } from './entities/flow.entity';

@Injectable()
export class FlowsService {
  constructor(
    @InjectRepository(Flow) private readonly flowRepo: Repository<Flow>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Domain) private readonly domainRepo: Repository<Domain>,
    @InjectRepository(Landing) private readonly landingRepo: Repository<Landing>,
    @InjectRepository(FacebookPixel) private readonly pixelRepo: Repository<FacebookPixel>
  ) {}

  async createFlow(dto: CreateFlowDto): Promise<Flow> {
    const domain = await this.domainRepo.findOneByOrFail({ id: dto.domainId });
    const landing = await this.landingRepo.findOneByOrFail({ id: dto.landingId });

    const flow = this.flowRepo.create({
      ...dto,
      domain,
      landing
    });

    if (dto.facebookPixelIds?.length) {
      const pixels = await this.pixelRepo.findByIds(dto.facebookPixelIds);
      flow.facebookPixels = pixels;
    }

    return this.flowRepo.save(flow);
  }

  async getFlows(query: { userId?: string; isActive?: boolean; name?: string }) {
    const qb = this.flowRepo
      .createQueryBuilder('flow')
      .leftJoinAndSelect('flow.user', 'user')
      .leftJoinAndSelect('flow.domain', 'domain')
      .leftJoinAndSelect('flow.landing', 'landing')
      .leftJoinAndSelect('flow.facebookPixels', 'facebookPixels');

    if (query.userId) qb.andWhere('user.id = :userId', { userId: query.userId });
    if (query.isActive !== undefined)
      qb.andWhere('flow.isActive = :isActive', { isActive: query.isActive });
    if (query.name) qb.andWhere('flow.name ILIKE :name', { name: `%${query.name}%` });

    return qb.getMany();
  }

  async deleteFlow(id: string) {
    const flow = await this.flowRepo.findOneByOrFail({ id });
    return this.flowRepo.remove(flow);
  }
}
