import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flow } from 'src/flows/entities/flow.entity';
import { Team } from 'src/team/entities/team.entity';

import { CloudflareAccountsController } from './cloudflare-accounts.controller';
import { CloudflareService } from './cloudflare/cloudflare.service';
import { DomainsCronService } from './cron/domains.cron';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';
import { CloudflareAccount } from './entities/cloudflare-account.entity';
import { Domain } from './entities/domain.entity';
import { NamecheapClient } from './namecheap/namecheap.client';

@Module({
  imports: [TypeOrmModule.forFeature([Domain, Team, Flow, CloudflareAccount])],
  controllers: [DomainsController, CloudflareAccountsController],
  providers: [DomainsService, NamecheapClient, CloudflareService, DomainsCronService],
  exports: [DomainsService]
})
export class DomainsModule {}
