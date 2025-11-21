import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudflareService } from 'src/domains/cloudflare/cloudflare.service';
import { DomainsModule } from 'src/domains/domains.module';
import { Team } from 'src/team/entities/team.entity';

import { FlowDomainCheckCron } from './cron/flow-domain-check.cron';
import { Flow } from './entities/flow.entity';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';

@Module({
  imports: [TypeOrmModule.forFeature([Flow, Team]), DomainsModule],
  controllers: [FlowsController],
  providers: [FlowsService, CloudflareService, FlowDomainCheckCron],
  exports: [FlowsService]
})
export class FlowsModule {}
