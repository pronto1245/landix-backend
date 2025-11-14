import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PurchaseDomainDto {
  @ApiProperty({
    example: 'mybrand.shop',
    description: 'Имя домена для покупки'
  })
  @IsString()
  @IsNotEmpty()
  domainName: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Количество лет регистрации'
  })
  @IsOptional()
  @IsNumber()
  years?: number;
}
