import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { DomainsService } from './domains.service';
import { BuyDomainDto } from './dto/buy-domain.dto';
import { CheckDomainDto } from './dto/check-domain.dto';
import { CustomDomainDto } from './dto/custom-domain.dto';
import { SystemDomainDto } from './dto/system-domain.dto';

@ApiTags('Домены')
@Controller('domains')
export class DomainsController {
  constructor(private readonly domainService: DomainsService) {}

  @Get('check')
  @ApiOperation({ summary: 'Проверить доступность домена' })
  @ApiQuery({ name: 'domain', example: 'example.fun' })
  @ApiResponse({ status: 200, description: 'Результат доступности' })
  async check(@Query() dto: CheckDomainDto) {
    const available = await this.domainService.checkAvailability(dto.domain);
    return { available };
  }

  @Post('buy')
  @ApiOperation({ summary: 'Покупка домена и привязка к потоку' })
  async buy(@Body() dto: BuyDomainDto) {
    return this.domainService.buyAndAttachToFlow(dto);
  }

  @Post('attach-system')
  @ApiOperation({ summary: 'Привязка системного домена к потоку' })
  async attachSystem(@Body() dto: SystemDomainDto) {
    return this.domainService.attachSystemDomain(dto);
  }

  @Post('attach-custom')
  @ApiOperation({ summary: 'Подключить свой собственный домен через API' })
  async attachCustom(@Body() dto: CustomDomainDto) {
    return this.domainService.attachCustomDomain(dto);
  }
}
