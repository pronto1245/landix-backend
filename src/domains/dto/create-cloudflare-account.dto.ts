import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateCloudflareAccountDto {
  @ApiProperty({
    example: 'Основной Cloudflare',
    description: 'Отображаемое название Cloudflare-аккаунта'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'Email, привязанный к Cloudflare'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'cf_token_123...',
    description: 'API Token Cloudflare с правами на создание зон'
  })
  @IsString()
  @IsNotEmpty()
  apiToken: string;
}
