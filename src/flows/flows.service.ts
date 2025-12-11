import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainsService } from 'src/domains/domains.service';
import { Landing } from 'src/landing/entities/landing.entity';
import { PreviewService } from 'src/landing/preview.service';
import { WhitePageService } from 'src/landing/white-page.service';
import { RedisService } from 'src/redis/redis.service';
import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import { CloakService } from './cloak';
import { CreateFlowWithDomainDto } from './dto/create-flow-with-domain.dto';
import { UpdateFlowDto } from './dto/update-flow.dto';
import { Flow } from './entities/flow.entity';
import { SplitTestService } from './split-test/split-test.service';

@Injectable()
export class FlowsService {
  private redis;

  constructor(
    @InjectRepository(Flow)
    private readonly flowRepo: Repository<Flow>,

    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,

    @InjectRepository(Landing)
    private readonly landingRepo: Repository<Landing>,

    private readonly domainsService: DomainsService,
    private readonly previewService: PreviewService,
    private readonly redisService: RedisService,
    private readonly cloak: CloakService,
    private readonly splitTestService: SplitTestService,
    private readonly whitePageService: WhitePageService
  ) {
    this.redis = this.redisService.getClient();
  }

  async getAll(teamId: string) {
    return this.flowRepo.find({
      where: { team: { id: teamId } },
      order: { createdAt: 'DESC' }
    });
  }

  async getById(id: string) {
    return this.flowRepo.findOneBy({ id });
  }

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
      return this.whitePageService.render(domain);
    }

    let finalLanding = landing;

    if (flow.splitTest?.enabled) {
      const ip = cloakResult.ip;

      const splitLanding = await this.splitTestService.pickLandingForFlow(flow, ip);

      if (splitLanding) {
        finalLanding = splitLanding;
      }
    }

    const html = this.previewService.render(finalLanding as any);
    return html;
  }

  async updateFlow(flowId: string, dto: UpdateFlowDto) {
    const flow = await this.flowRepo.findOne({
      where: { id: flowId },
      relations: ['landing']
    });

    if (!flow) throw new NotFoundException('Flow not found');

    if (dto.landingId) {
      const landing = await this.landingRepo.findOne({
        where: { id: dto.landingId }
      });

      if (!landing) throw new NotFoundException('Landing not found');
      flow.landing = landing;
    }

    if (dto.cloak) {
      flow.cloak = {
        ...(flow.cloak || {}),
        ...dto.cloak
      };

      Object.keys(flow.cloak).forEach((key) => {
        if (flow.cloak[key] === undefined) delete flow.cloak[key];
      });
    }

    if (dto.splitTest) {
      await this.splitTestService.clearCacheForFlow(flowId);

      const total = dto.splitTest.variants?.reduce((s, v) => s + Number(v.weight || 0), 0) ?? 0;

      if (total > 100) {
        throw new BadRequestException('Total weight cannot exceed 100');
      }

      if (!dto.splitTest.enabled) {
        flow.splitTest = {
          enabled: false,
          variants: []
        };
      } else {
        flow.splitTest = {
          enabled: true,
          variants: dto.splitTest.variants.map((v) => ({
            landingId: v.landingId,
            weight: Number(v.weight)
          }))
        };
      }
    }

    if (dto.name) {
      flow.name = dto.name;
    }

    await this.flowRepo.save(flow);

    const updated = await this.flowRepo.findOne({
      where: { id: flow.id },
      relations: ['landing']
    });

    return {
      message: 'Flow updated',
      data: updated
    };
  }

  async delete(flowId: string) {
    return await this.flowRepo.delete(flowId);
  }
}
