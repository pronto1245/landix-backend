import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainsService } from 'src/domains/domains.service';
import { Team } from 'src/team/entities/team.entity';
import { Repository } from 'typeorm';

import { CreateFlowWithDomainDto } from './dto/create-flow-with-domain.dto';
import { Flow } from './entities/flow.entity';

@Injectable()
export class FlowsService {
  constructor(
    @InjectRepository(Flow)
    private readonly flowRepo: Repository<Flow>,

    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,

    private readonly domainsService: DomainsService
  ) {}

  async createWithDomain(teamId: string, dto: CreateFlowWithDomainDto) {
    const team = await this.teamRepo.findOneBy({ id: teamId });

    if (!team) throw new BadRequestException('Команда не найдена');

    const flow = this.flowRepo.create({
      name: dto.name,
      team: { id: team.id },
      status: 'draft'
    });

    await this.flowRepo.save(flow);

    const { domain } = await this.domainsService.attachDomainToFlow(team.id, flow.id, dto);

    flow.domain = domain;
    await this.flowRepo.save(flow);

    return {
      message: 'Поток успешно создан',
      data: flow
    };
  }

  async getAll(teamId: string) {
    return this.flowRepo.find({
      where: { team: { id: teamId } },
      order: { createdAt: 'DESC' }
    });
  }

  async delete(flowId: string) {
    return await this.flowRepo.delete(flowId);
  }
}
