import { Body, Controller, Get, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

import { DomainsService } from './domains.service';
import { CreateCloudflareAccountDto } from './dto/create-cloudflare-account.dto';

@ApiTags('Cloudflare Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('domains/cloudflare-accounts')
export class CloudflareAccountsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Get()
  @ApiOperation({
    summary: 'Список Cloudflare-аккаунтов команды',
    description: 'Возвращает аккаунты Cloudflare, привязанные к команде.'
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'Основной CF аккаунт',
          email: 'admin@gmail.com',
          accountId: 'cf123123123123',
          createdAt: '2025-01-01T00:00:00.000Z'
        }
      ]
    }
  })
  async getAccounts(@CurrentUser() user: User) {
    if (!user.activeTeam) throw new NotFoundException('Команда не найдена');
    return this.domainsService.getCloudflareAccounts(user.activeTeam.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Добавить Cloudflare-аккаунт',
    description: `Создаёт и сохраняет Cloudflare API токен + accountId для команды.`
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        id: 'uuid',
        name: 'My CF Account',
        email: 'user@gmail.com',
        accountId: 'cf123',
        createdAt: '2025-01-01T00:00:00.000Z'
      }
    }
  })
  async addAccount(@CurrentUser() user: User, @Body() dto: CreateCloudflareAccountDto) {
    if (!user.activeTeam) throw new NotFoundException('Команда не найдена');
    return this.domainsService.addCloudflareAccount(user.activeTeam.id, dto);
  }
}
