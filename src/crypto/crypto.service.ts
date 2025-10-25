import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { TeamBalance } from 'src/team/entities/team-balance.entity';
import { TeamService } from 'src/team/team.service';
import { User } from 'src/users/entities/user.entity';
import { Between, DataSource, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { CreateCryptoPaymentDto } from './dto/create-payment.dto';
import { CryptoPayment } from './entities/crypto-payment.entity';
import { FinanceTransaction } from './entities/finance-transaction.entity';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly apiKey = process.env.CRYPTOCLOUD_API_KEY;
  private readonly shopId = process.env.CRYPTOCLOUD_SHOP_ID;
  private readonly webhookSecret =
    process.env.CRYPTOCLOUD_WEBHOOK_SECRET || 'FsTLIxjUhtwuhRHifbQyUZh22zhrfoinl0Xz';

  constructor(
    @InjectRepository(CryptoPayment)
    private readonly cryptoRepo: Repository<CryptoPayment>,
    @InjectRepository(FinanceTransaction)
    private readonly transactionRepo: Repository<FinanceTransaction>,
    private readonly dataSource: DataSource,
    private readonly teamService: TeamService
  ) {}

  async getPayments(user: User, startDate: string, endDate: string) {
    if (!user.activeTeam) throw new NotFoundException('Команда не выбрана');

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.cryptoRepo.find({
      where: {
        team: { id: user.activeTeam.id },
        createdAt: Between(start, end)
      },
      order: { createdAt: 'DESC' }
    });
  }

  async getTransactions(user: User, startDate: string, endDate: string) {
    if (!user.activeTeam) throw new NotFoundException('Команда не выбрана');

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.transactionRepo.find({
      where: {
        team: { id: user.activeTeam.id },
        createdAt: Between(start, end)
      },
      order: { createdAt: 'DESC' }
    });
  }

  async createPayment(user: User, dto: CreateCryptoPaymentDto) {
    try {
      if (!user.activeTeam) throw new NotFoundException('Команда не выбрана');

      const isMember = await this.teamService.isMember(user.id, user.activeTeam.id);

      if (!isMember) throw new ForbiddenException('Вы не участник этой команды');

      const team = await this.teamService.findById(user.activeTeam.id);

      const orderId = `${user.id}-${uuid()}`;

      const payload = {
        shop_id: this.shopId,
        amount: dto.amountUsd,
        order_id: orderId,
        add_fields: {
          available_currencies: ['USDT_TRC20'],
          cryptocurrency: 'USDT_TRC20'
        }
      };

      const res = await axios.post('https://api.cryptocloud.plus/v2/invoice/create', payload, {
        headers: {
          Authorization: `Token ${this.apiKey}`
        }
      });

      const result = res.data.result;

      const payment = this.cryptoRepo.create({
        user,
        team,
        currency: result.currency.fullcode,
        amountUsd: Number(result.amount_usd),
        invoiceId: result.uuid,
        orderId,
        invoiceUrl: result.link,
        expiresAt: result.expiry_date,
        status: 'waiting'
      });

      await this.cryptoRepo.save(payment);

      return {
        invoiceUrl: result.link
      };
    } catch (err) {
      this.logger.error('Failed to create CryptoCloud invoice', err?.response?.data || err.message);
      throw new InternalServerErrorException('Ошибка создания счета через CryptoCloud');
    }
  }

  async handleWebhook(payload: any) {
    try {
      await this.dataSource.transaction(async (manager) => {
        const paymentRepo = manager.getRepository(CryptoPayment);
        const balanceRepo = manager.getRepository(TeamBalance);

        const payment = await paymentRepo.findOne({
          where: { orderId: payload.orderId },
          relations: ['team', 'team.balance']
        });

        if (!payment) throw new NotFoundException('Платеж не найден');

        if (payment.status === 'confirmed') throw new ConflictException('Платеж уже подтвержден');

        if (payload.status === 'success') {
          payment.status = 'confirmed';

          await paymentRepo.save(payment);

          const teamBalance = await balanceRepo.findOne({
            where: { team: { id: payment.team.id } },
            relations: ['team']
          });

          if (!teamBalance) throw new NotFoundException('Баланс команды не найден');

          teamBalance.amount = Number(teamBalance.amount) + Number(payment.amountUsd);
          await balanceRepo.save(teamBalance);

          this.logger.log(`Webhook: Confirmed payment ${payment.orderId} and updated balance`);
        } else {
          this.logger.warn(`Webhook: Unknown status "${payload.status}" for ${payment.orderId}`);
        }
      });
    } catch (err) {
      this.logger.error('Webhook error', err?.message || err);
      throw err;
    }
  }
}
