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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  async check(@Query() dto: CheckDomainDto) {
    return this.service.checkDomain(dto);
  }

  @Post('purchase')
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
