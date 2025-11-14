import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainsModule } from 'src/domains/domains.module';
import { Team } from 'src/team/entities/team.entity';

import { Flow } from './entities/flow.entity';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';

@Module({
  imports: [TypeOrmModule.forFeature([Flow, Team]), DomainsModule],
  controllers: [FlowsController],
  providers: [FlowsService],
  exports: [FlowsService]
})
export class FlowsModule {}
