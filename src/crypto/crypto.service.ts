import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { BalanceService } from 'src/balance/balance.service';
import { User } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { CreateCryptoPaymentDto } from './dto/create-payment.dto';
import { CryptoPayment } from './entities/crypto-payment.entity';

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
    private readonly balanceService: BalanceService,
    private readonly dataSource: DataSource
  ) {}

  async createPayment(user: User, dto: CreateCryptoPaymentDto) {
    try {
      const orderId = `${user.id}-${uuid()}`;

      const payload = {
        shop_id: this.shopId,
        amount: dto.amountUsd,
        currency: 'USD',
        order_id: orderId,
        add_fields: {
          available_currencies: [dto.currency],
          cryptocurrency: dto.currency
        },
        webhook_url: 'https://nn-purchase-organized-propose.trycloudflare.com/crypto/webhook',
        success_url: 'https://platform.landix/success',
        fail_url: 'https://platform.landix/fail'
      };

      const res = await axios.post('https://api.cryptocloud.plus/v2/invoice/create', payload, {
        headers: {
          Authorization: `Token ${this.apiKey}`
        }
      });

      const result = res.data.result;

      const payment = this.cryptoRepo.create({
        user,
        currency: result.currency.fullcode,
        amountUsd: Number(result.amount_usd),
        orderId,
        paymentId: result.uuid,
        invoiceUrl: result.link,
        status: 'waiting'
      });

      return await this.cryptoRepo.save(payment);
    } catch (err) {
      this.logger.error('Failed to create CryptoCloud invoice', err?.response?.data || err.message);
      throw new InternalServerErrorException('Ошибка создания счета через CryptoCloud');
    }
  }

  async handleWebhook(payload: any) {
    try {
      await this.dataSource.transaction(async (manager) => {
        const paymentRepo = manager.getRepository(CryptoPayment);
        const payment = await paymentRepo.findOne({
          where: { orderId: payload.order_id },
          relations: ['user']
        });

        if (!payment) {
          this.logger.warn(`Webhook: Payment not found: ${payload.order_id}`);
          throw new NotFoundException('Платеж не найден');
        }

        if (payment.status === 'confirmed') {
          this.logger.warn(`Webhook: Duplicate webhook for ${payment.orderId}`);
          throw new ConflictException('Платеж уже подтвержден');
        }

        if (payload.status === 'success') {
          payment.status = 'confirmed';
          await paymentRepo.save(payment);

          try {
            await this.balanceService.addDeposit(payment.user, payment.amountUsd, {
              currency: payment.currency,
              description: 'Crypto deposit via CryptoCloud'
            });

            this.logger.log(`Webhook: Confirmed payment ${payment.orderId} and updated balance`);
          } catch (err) {
            this.logger.error(`Webhook: Failed to add deposit for ${payment.orderId}`, err);
            throw new InternalServerErrorException('Ошибка при зачислении баланса');
          }
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
