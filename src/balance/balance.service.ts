import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import { BalanceTransaction } from './entities/balance-transaction.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(BalanceTransaction)
    private readonly trxRepo: Repository<BalanceTransaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async addDeposit(
    user: User,
    amount: number,
    meta?: { currency?: string; txHash?: string; description?: string }
  ) {
    user.balance = Number(user.balance || 0) + Number(amount);
    await this.userRepo.save(user);

    const trx = this.trxRepo.create({
      user,
      type: 'deposit',
      amountUsd: amount,
      currency: meta?.currency,
      txHash: meta?.txHash,
      description: meta?.description
    });

    return await this.trxRepo.save(trx);
  }
}
