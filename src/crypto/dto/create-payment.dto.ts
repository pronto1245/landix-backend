import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min } from 'class-validator';

export class CreateCryptoPaymentDto {
  @ApiProperty({
    enum: ['USDT_TRC20', 'USDT_ERC20', 'BTC', 'ETH', 'TST'],
    example: 'USDT_TRC20',
    description: 'Криптовалюта для пополнения'
  })
  @IsEnum(['USDT_TRC20', 'USDT_ERC20', 'BTC', 'ETH'])
  currency: 'BTC' | 'ETH' | 'USDT_ERC20' | 'USDT_TRC20';

  @ApiProperty({
    example: 15,
    minimum: 1,
    description: 'Сумма пополнения в USD'
  })
  @IsNumber()
  @Min(1)
  amountUsd: number;
}
