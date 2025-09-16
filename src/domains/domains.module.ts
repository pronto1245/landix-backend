import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CloudflareService } from './cloudflare.service';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';
import { Domain } from './entities/domain.entity';
import { RegRuService } from './reg-ru.service';

@Module({
  imports: [TypeOrmModule.forFeature([Domain])],
  controllers: [DomainsController],
  providers: [DomainsService, RegRuService, CloudflareService]
})
export class DomainsModule {}
