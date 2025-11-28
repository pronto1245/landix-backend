import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudflareService } from 'src/domains/cloudflare/cloudflare.service';
import { DomainsModule } from 'src/domains/domains.module';
import { Landing } from 'src/landing/entities/landing.entity';
import { PreviewService } from 'src/landing/preview.service';
import { Team } from 'src/team/entities/team.entity';

import { CloakService } from './cloak';
import { GeoService } from './cloak/geo.service';
import { FlowDomainCheckCron } from './cron/flow-domain-check.cron';
import { Flow } from './entities/flow.entity';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';

@Module({
  imports: [TypeOrmModule.forFeature([Flow, Team, Landing]), DomainsModule],
  controllers: [FlowsController],
  providers: [
    FlowsService,
    PreviewService,
    CloudflareService,
    FlowDomainCheckCron,
    CloakService,
    GeoService
  ],
  exports: [FlowsService]
})
export class FlowsModule {}
