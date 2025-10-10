import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamModule } from 'src/team/team.module';

import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { CryptoPayment } from './entities/crypto-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CryptoPayment]), TeamModule],
  controllers: [CryptoController],
  providers: [CryptoService]
})
export class CryptoModule {}
