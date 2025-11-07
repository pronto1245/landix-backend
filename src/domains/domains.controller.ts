import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

import { DomainsService } from './domains.service';
import { CheckDomainDto } from './dto/check-domain.dto';
import { PurchaseDomainDto } from './dto/purchase-domain.dto';

@ApiTags('Domains')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('domains')
export class DomainsController {
  constructor(private readonly service: DomainsService) {}

  @Get('check')
  @ApiOperation({ summary: 'Проверить доступность домена' })
  @ApiQuery({ name: 'name', description: 'Имя домена, например: example.fun' })
  async check(@Query() dto: CheckDomainDto) {
    return this.service.checkDomain(dto);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Проверить доступность домена' })
  @ApiQuery({ name: 'name', description: 'Имя домена, например: example.fun' })
  async getSuggestions(@Query('name') name: string) {
    return this.service.getDomainSuggestions(name);
  }

  @Post('purchase')
  @ApiBody({
    description: 'Параметры покупки домена',
    type: PurchaseDomainDto,
    examples: {
      example1: {
        summary: 'Пример запроса',
        value: {
          domainName: 'mycasino.shop',
          years: 1
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'Информация о купленном домене',
    schema: {
      example: {
        success: true,
        message: 'Домен успешно куплен',
        data: {
          id: '6b911ea4-f2d5-4a0e-89c2-1cfd2a61b1d7',
          name: 'mycasino.shop',
          priceUsd: 0.98,
          expiresAt: '2026-11-06T00:00:00.000Z'
        }
      }
    }
  })
  async purchase(@CurrentUser() user: User, @Body() dto: PurchaseDomainDto) {
    if (!user.activeTeam) throw new NotFoundException('Команда не найдена');

    return this.service.purchaseDomain(user.activeTeam.id, dto);
  }

  @Get()
  async getAll(@CurrentUser() user: User) {
    if (!user.activeTeam) throw new NotFoundException('Команда не найдена');
    return this.service.getAll(user.activeTeam.id);
  }

  @Get(':name/info')
  async getInfo(@Param('name') name: string) {
    return this.service.getInfo(name);
  }
}
