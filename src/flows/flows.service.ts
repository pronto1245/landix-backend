import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainsService } from 'src/domains/domains.service';
import { Landing } from 'src/landing/entities/landing.entity';
import { PreviewService } from 'src/landing/preview.service';
import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import { CloakService } from './cloak';
import { CreateFlowWithDomainDto } from './dto/create-flow-with-domain.dto';
import { UpdateCloakDto } from './dto/update-cloak.dto';
import { Flow } from './entities/flow.entity';

@Injectable()
export class FlowsService {
  constructor(
    @InjectRepository(Flow)
    private readonly flowRepo: Repository<Flow>,

    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,

    @InjectRepository(Landing)
    private readonly landingRepo: Repository<Landing>,

    private readonly domainsService: DomainsService,
    private readonly previewService: PreviewService,
    private readonly cloak: CloakService
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

  async updateLanding(flowId: string, landingId: string) {
    const flow = await this.flowRepo.findOne({
      where: {
        id: flowId
      }
    });

    if (!flow) throw new NotFoundException('Flow not found');

    const landing = await this.landingRepo.findOne({
      where: { id: landingId }
    });

    if (!landing) throw new NotFoundException('Landing not found');

    flow.landing = landing;

    return this.flowRepo.save(flow);
  }

  async getFlowByDomain(domain: string) {
    const flow = await this.flowRepo.findOne({
      where: {
        domain: {
          name: domain
        }
      }
    });

    if (!flow) throw new NotFoundException('Flow not found');

    if (!flow.landing) throw new NotFoundException('Landing not found');

    const landing = await this.landingRepo.findOne({ where: { id: flow.landing.id } });

    if (!landing) throw new NotFoundException('Landing not found');

    return {
      flow,
      landing
    };
  }

  async renderFlow(domain: string, req: any) {
    if (!domain) throw new NotFoundException('No domain');

    const { flow, landing } = await this.getFlowByDomain(domain);

    const cloakResult = await this.cloak.check(req, flow.cloak);

    if (!cloakResult.passed) {
      return (
        flow.cloak?.whitePageHtml ||
        `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"><title>Access Denied</title></head>
        <body>
          <h2>Access Denied</h2>
          <p>${cloakResult.reason}</p>
        </body>
      </html>
    `
      );
    }

    const html = this.previewService.render(landing as any);

    return html;
  }

  async updateCloak(flowId: string, dto: UpdateCloakDto) {
    const flow = await this.flowRepo.findOne({
      where: { id: flowId }
    });

    if (!flow) throw new NotFoundException('Flow not found');

    flow.cloak = {
      ...flow.cloak,
      ...dto
    };

    await this.flowRepo.save(flow);

    return {
      message: 'Cloak settings updated successfully',
      cloak: flow.cloak
    };
  }

  async delete(flowId: string) {
    return await this.flowRepo.delete(flowId);
  }
}
