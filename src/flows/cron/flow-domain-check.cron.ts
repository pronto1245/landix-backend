import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudflareService } from 'src/domains/cloudflare/cloudflare.service';
import { Repository } from 'typeorm';

import { Flow } from '../entities/flow.entity';

@Injectable()
export class FlowDomainCheckCron {
  private readonly logger = new Logger(FlowDomainCheckCron.name);

  constructor(
    @InjectRepository(Flow)
    private readonly flowRepo: Repository<Flow>,
    private readonly cloudflare: CloudflareService
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkDomains() {
    this.logger.log('⏳ Проверка статуса доменов в Cloudflare...');

    const flows = await this.flowRepo.find({
      where: { status: 'domain_check' },
      relations: ['domain']
    });

    for (const flow of flows) {
      if (!flow.domain || !flow.domain.nsRecords) continue;

      try {
        const zoneId = await this.cloudflare.getZoneId(flow.domain.name);

        if (!zoneId) continue;

        const info = await this.cloudflare.getZoneInfo(zoneId);

        if (info.status === 'active') {
          flow.status = 'active';
          await this.flowRepo.save(flow);

          this.logger.log(`✅ Домен активен: ${flow.domain.name} → Поток разблокирован`);
        }
      } catch {
        this.logger.warn(`Cloudflare check failed for ${flow.domain?.name}`);
      }
    }
  }
}
