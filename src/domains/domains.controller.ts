import { Controller, Get, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

import { CloudflareService } from './cloudflare/cloudflare.service';
import { DomainsService } from './domains.service';

@ApiTags('Domains')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('domains')
export class DomainsController {
  constructor(
    private readonly service: DomainsService,
    private readonly cloudflareService: CloudflareService
  ) {}

  @Get('suggestions')
  @ApiOperation({
    summary: 'Получить предложения доменов',
    description: `Возвращает список доменных зон (.shop, .online, .space), их доступность и стоимость.`
  })
  @ApiQuery({ name: 'name', example: 'mybrand', description: 'Базовое имя домена' })
  @ApiResponse({
    status: 200,
    description: 'Предложения доменов',
    schema: {
      example: [
        {
          domain: 'mybrand.shop',
          available: true,
          premium: false,
          priceUsd: 0.98,
          renewalUsd: 48.98
        }
      ]
    }
  })
  async getSuggestions(@Query('name') name: string) {
    return this.service.getDomainSuggestions(name);
  }

  @Get('system')
  @ApiOperation({
    summary: 'Получить список системных доменов',
    description: 'Возвращает все домены, которые заранее куплены платформой.'
  })
  @ApiResponse({
    status: 200,
    description: 'Список системных доменов',
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'super-landing.shop',
          provider: 'system',
          status: 'available',
          createdAt: '2025-01-01T00:00:00.000Z'
        }
      ]
    }
  })
  async getSystemDomains(@CurrentUser() user: User) {
    if (!user.activeTeam) throw new NotFoundException('Команда не найдена');
    return this.service.getSystemDomains();
  }

  @Get('purchased')
  @ApiOperation({
    summary: 'Получить купленные домены команды',
    description: 'Показывает все домены, купленные через Namecheap и ещё не привязанные к потокам.'
  })
  @ApiResponse({
    status: 200,
    description: 'Список доменов команды',
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'mybrand.shop',
          provider: 'namecheap',
          status: 'purchased',
          expiresAt: '2026-01-10T00:00:00.000Z',
          nsRecords: ['ns1.cloudflare.com', 'ns2.cloudflare.com']
        }
      ]
    }
  })
  async getPurchasedDomains(@CurrentUser() user: User) {
    if (!user.activeTeam) throw new NotFoundException('Команда не найдена');
    return this.service.getPurchasedDomains(user.activeTeam.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Все домены команды',
    description: 'Возвращает список всех доменов команды — custom, namecheap, system'
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'mybrand.shop',
          provider: 'namecheap',
          status: 'attached',
          flowId: 'uuid',
          nsRecords: ['...']
        }
      ]
    }
  })
  async getAll(@CurrentUser() user: User) {
    if (!user.activeTeam) throw new NotFoundException('Команда не найдена');
    return this.service.getAll(user.activeTeam.id);
  }

  @Get(':name/info')
  @ApiOperation({
    summary: 'Получить детальную информацию о домене',
    description: 'Делает запрос в Namecheap API и возвращает расширенную информацию'
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        DomainName: 'mybrand.shop',
        Whoisguard: 'ENABLED',
        Created: '2025-01-07',
        Expires: '2026-01-07'
      }
    }
  })
  async getInfo(@Param('name') name: string) {
    return this.service.getInfo(name);
  }

  @Post(':domain/cloudflare/ns')
  @ApiOperation({ summary: 'Получить NS Cloudflare' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        domain: 'mybrand.shop',
        zoneId: 'uuid',
        status: 'pending',
        nameservers: ['ns1.cloudflare.com', 'ns2.cloudflare.com']
      }
    }
  })
  @ApiParam({
    name: 'domain',
    example: 'mybrand.shop'
  })
  async getCloudflareNs(@Param('domain') domain: string) {
    return this.cloudflareService.getOrCreateNameservers(domain);
  }

  @Post('sync-system')
  @ApiOperation({ summary: 'Синхронизировать системные домены из Namecheap' })
  async syncSystem() {
    return this.service.syncSystemDomainsFromNamecheap();
  }
}
