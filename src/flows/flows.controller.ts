import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { SkipTransform } from 'src/common/decorators/skip-transform.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

import { CreateFlowWithDomainDto } from './dto/create-flow-with-domain.dto';
import { UpdateCloakDto } from './dto/update-cloak.dto';
import { UpdateLandingDto } from './dto/update-landing.dto';
import { FlowsService } from './flows.service';

@ApiTags('Flows')
@Controller('flows')
export class FlowsController {
  constructor(private readonly service: FlowsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('create-with-domain')
  @ApiOperation({
    summary: 'Создать поток',
    description: `Этап 1. Создаёт поток в статусе "draft" и привязывает домен (buy/system/user/custom)`
  })
  @ApiResponse({
    status: 201,
    description: 'Поток успешно создан',
    schema: {
      example: {
        success: true,
        message: 'Поток успешно создан',
        data: {
          id: 'uuid',
          name: 'My Test Flow',
          status: 'draft',
          domain: {
            id: 'uuid',
            name: 'mybrand.shop',
            provider: 'namecheap',
            status: 'attached',
            nsRecords: ['ns1.cloudflare.com', 'ns2.cloudflare.com']
          }
        }
      }
    }
  })
  async createWithDomain(@CurrentUser() user: User, @Body() dto: CreateFlowWithDomainDto) {
    if (!user.activeTeam) throw new NotFoundException('Команда не найдена');
    return this.service.createWithDomain(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Получить все потоки команды' })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'My Flow',
          status: 'draft',
          createdAt: '2025-01-02T00:00:00.000Z',
          domain: { id: 'uuid', name: 'mybrand.shop' }
        }
      ]
    }
  })
  async getAll(@CurrentUser() user: User) {
    if (!user.activeTeam) throw new NotFoundException('Команда не найдена');
    return this.service.getAll(user.activeTeam.id);
  }

  @Public()
  @SkipTransform()
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Get('render')
  async getFlowByDomain(@Req() req, @Query('domain') domain: string) {
    return this.service.renderFlow(domain, req);
  }

  @Patch(':flowId/cloak')
  @ApiOperation({ summary: 'Обновить настройки клоаки у потока' })
  @ApiOkResponse({ description: 'Настройки клоаки обновлены успешно' })
  async updateCloak(@Param('flowId') flowId: string, @Body() dto: UpdateCloakDto) {
    return this.service.updateCloak(flowId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/landing')
  @ApiOperation({ summary: 'Обновить лендинг' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID потока' })
  async updateLanding(@Param('id') id: string, @Body() dto: UpdateLandingDto) {
    return this.service.updateLanding(id, dto.landingId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить поток' })
  @ApiResponse({
    status: 200,
    description: 'Удалено',
    schema: { example: { success: true } }
  })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
