import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateCryptoPaymentDto {
  @ApiProperty({
    example: 'USD',
    description: 'Валюта пополнения'
  })
  @IsString()
  currency: string;

  @ApiProperty({
    example: 30,
    minimum: 30,
    description: 'Сумма пополнения в USD'
  })
  @IsNumber()
  @Min(30)
  amountUsd: number;
}
