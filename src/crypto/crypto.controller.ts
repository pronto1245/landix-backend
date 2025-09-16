import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

import { CryptoService } from './crypto.service';
import { CreateCryptoPaymentDto } from './dto/create-payment.dto';
import { CryptoPayment } from './entities/crypto-payment.entity';

@ApiTags('Crypto')
@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('create')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Создание заявки на пополнение баланса в криптовалюте' })
  @ApiResponse({ status: 201, type: CryptoPayment })
  create(@Body() dto: CreateCryptoPaymentDto, @CurrentUser() user: User) {
    return this.cryptoService.createPayment(user, dto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook от NowPayments (можно вручную через Swagger)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        payment_id: { type: 'string', example: 'mock-1691399999999' },
        payment_status: { type: 'string', example: 'confirmed' },
        ipn_secret: { type: 'string', example: 'S5R47LHc1ZjkjulmXy9GLLH2s/jZgBOu' },
        payin_txid: { type: 'string', example: 'fake_tx_hash_123' },
        confirmations: { type: 'number', example: 3 }
      },
      required: ['payment_id', 'payment_status', 'ipn_secret']
    }
  })
  @ApiResponse({ status: 200, description: 'ok' })
  async webhook(@Body() body: any) {
    await this.cryptoService.handleWebhook(body);
    return { ok: true };
  }
}
