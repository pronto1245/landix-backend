import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

import { Landing } from './entities/landing.entity';
import { LandingController } from './landing.controller';
import { LandingService } from './landing.service';
import { PreviewService } from './preview.service';

@Module({
  imports: [TypeOrmModule.forFeature([Landing, User])],
  controllers: [LandingController],
  providers: [LandingService, PreviewService],
  exports: [LandingService]
})
export class LandingModule {}
