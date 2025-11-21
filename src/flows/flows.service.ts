import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainsService } from 'src/domains/domains.service';
import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
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

  async createWithDomain(user: User, dto: CreateFlowWithDomainDto) {
    if (!user.activeTeam) throw new BadRequestException('Команда не найдена');

    const team = await this.teamRepo.findOneBy({ id: user.activeTeam.id });

    if (!team) throw new BadRequestException('Команда не найдена');

    const flow = this.flowRepo.create({
      name: dto.name,
      team,
      creator: user,
      status: 'domain_check'
    });

    await this.flowRepo.save(flow);

    const { domain } = await this.domainsService.attachDomainToFlow(team.id, flow, dto);

    flow.domain = domain;
    flow.status = 'domain_check';
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
