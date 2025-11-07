import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from 'src/team/entities/team.entity';

import { CloudflareService } from './cloudflare/cloudflare.service';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';
import { Domain } from './entities/domain.entity';
import { NamecheapClient } from './namecheap/namecheap.client';

@Module({
  imports: [TypeOrmModule.forFeature([Domain, Team])],
  controllers: [DomainsController],
  providers: [DomainsService, NamecheapClient, CloudflareService],
  exports: [DomainsService]
})
export class DomainsModule {}
