import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

import { CryptoService } from './crypto.service';
import { CreateCryptoPaymentDto } from './dto/create-payment.dto';
import { CryptoPayment } from './entities/crypto-payment.entity';

@ApiTags('Finance')
@Controller('finance')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('payments')
  @ApiOperation({ summary: 'Получение истории пополнений команды' })
  @ApiResponse({ status: 200, type: [CryptoPayment] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getPayments(
    @CurrentUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.cryptoService.getPayments(user, startDate, endDate);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'История расходов (списаний)' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getTransactions(
    @CurrentUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.cryptoService.getTransactions(user, startDate, endDate);
  }

  @Post('create')
  @ApiOperation({ summary: 'Создание заявки на пополнение баланса в криптовалюте' })
  @ApiResponse({ status: 201, type: CryptoPayment })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateCryptoPaymentDto, @CurrentUser() user: User) {
    return this.cryptoService.createPayment(user, dto);
  }

  @Post('webhook')
  @ApiResponse({ status: 200, description: 'ok' })
  async webhook(@Body() body: any) {
    await this.cryptoService.handleWebhook(body);
    return { ok: true };
  }
}
