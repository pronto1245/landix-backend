import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFlowWithDomainDto {
  @ApiProperty({
    example: 'Мой первый поток',
    description: 'Название потока'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'buy',
    description: 'Тип добавления домена',
    enum: ['buy', 'system', 'user', 'custom']
  })
  @IsEnum(['buy', 'system', 'user', 'custom'])
  domainType: 'buy' | 'custom' | 'system' | 'user';

  @ApiPropertyOptional({
    example: 'mybrand.shop',
    description: 'Имя домена (для buy/custom)'
  })
  @IsOptional()
  @IsString()
  domainName?: string;

  @ApiPropertyOptional({
    example: 'b1f4f7c8-0aca-4d93-88cb-6fe33d13c892',
    description: 'ID системного или купленного домена'
  })
  @IsOptional()
  @IsString()
  domainId?: string;

  @ApiPropertyOptional({
    example: 'cf_acc_uuid',
    description: 'ID Cloudflare-аккаунта команды (для custom)'
  })
  @IsOptional()
  @IsString()
  cloudflareAccountId?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Дата окончания регистрации домена (для custom)'
  })
  @IsOptional()
  expiresAt?: Date;
}
