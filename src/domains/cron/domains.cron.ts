import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DomainsService } from '../domains.service';

@Injectable()
export class DomainsCronService {
  private readonly logger = new Logger(DomainsCronService.name);

  constructor(private readonly domainsService: DomainsService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncSystemDomains() {
    try {
      this.logger.log('⏳ Синхронизация системных доменов...');
      const result = await this.domainsService.syncSystemDomainsFromNamecheap();
      this.logger.log(
        `✅ Системные домены обновлены: +${result.added.length}, ~${result.updated.length}`
      );
    } catch (e) {
      this.logger.error('❌ Ошибка синхронизации системных доменов', e);
    }
  }
}
