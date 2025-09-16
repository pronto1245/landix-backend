import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

import { BalanceService } from './balance.service';
import { BalanceTransaction } from './entities/balance-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BalanceTransaction, User])],
  providers: [BalanceService],
  exports: [BalanceService]
})
export class BalanceModule {}
