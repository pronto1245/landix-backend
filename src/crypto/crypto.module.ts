import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamModule } from 'src/team/team.module';

import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { CryptoPayment } from './entities/crypto-payment.entity';
import { FinanceTransaction } from './entities/finance-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CryptoPayment, FinanceTransaction]), TeamModule],
  controllers: [CryptoController],
  providers: [CryptoService]
})
export class CryptoModule {}
