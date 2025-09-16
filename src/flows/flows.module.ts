import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domain } from 'src/domains/entities/domain.entity';
import { FacebookPixel } from 'src/facebook/entities/facebook-pixel.entity';
import { Landing } from 'src/landing/entities/landing.entity';
import { User } from 'src/users/entities/user.entity';

import { Flow } from './entities/flow.entity';
import { FlowsController } from './flows.controller';
import { FlowsService } from './flows.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Flow, Domain, FacebookPixel, Landing])],
  controllers: [FlowsController],
  providers: [FlowsService]
})
export class FlowsModule {}
