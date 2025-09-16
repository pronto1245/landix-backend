import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domain } from 'src/domains/entities/domain.entity';
import { FacebookPixel } from 'src/facebook/entities/facebook-pixel.entity';
import { Flow } from 'src/flows/entities/flow.entity';
import { Landing } from 'src/landing/entities/landing.entity';

import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Flow, Domain, FacebookPixel, Landing])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
