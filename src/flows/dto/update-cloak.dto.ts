import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCloakDto {
  @ApiPropertyOptional({ description: 'Включена ли клоака', example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Разрешенные GEO (только эти страны)',
    example: 'CA'
  })
  @IsOptional()
  @IsString({ each: true })
  allowedCountry?: string;

  @ApiPropertyOptional({
    description: 'Запрещенные GEO',
    example: ['RU', 'BY']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bannedCountries?: string[];

  @ApiPropertyOptional({
    description: 'Блокировать ботов',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  blockBots?: boolean;

  @ApiPropertyOptional({
    description: 'HTML белой страницы (White Page)',
    example: '<h1>Access Denied</h1>'
  })
  @IsOptional()
  @IsString()
  whitePageHtml?: string;
}
