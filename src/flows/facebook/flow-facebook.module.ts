import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Flow } from '../entities/flow.entity';
import { FlowFacebookPixel } from './entities/flow-facebook-pixel.entity';
import { FlowFacebookController } from './flow-facebook.controller';
import { FlowFacebookService } from './flow-facebook.service';

@Module({
  imports: [TypeOrmModule.forFeature([Flow, FlowFacebookPixel])],
  controllers: [FlowFacebookController],
  providers: [FlowFacebookService],
  exports: [FlowFacebookService]
})
export class FlowFacebookModule {}
