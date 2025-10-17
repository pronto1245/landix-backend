import type { Response } from 'express';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

import { CreateLandingDto } from './dto/create-landing.dto';
import { EditLandingDto } from './dto/edit-landing.dto';
import { PreviewDto } from './dto/preview.dto';
import { LandingService } from './landing.service';
import { PreviewService } from './preview.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('landing')
export class LandingController {
  constructor(
    private readonly landingService: LandingService,
    private readonly previewService: PreviewService
  ) {}

  @Get('')
  @ApiOperation({ summary: 'Получить список лендингов с пагинацией и фильтрами' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'name', required: false, example: 'Aviator' })
  @ApiQuery({ name: 'template', required: false, example: 'aviator-basic' })
  @ApiQuery({ name: 'creator', required: false, example: 'creator uuid' })
  async list(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('name') name?: string,
    @Query('template') template?: string,
    @Query('creator') creator?: string
  ) {
    return this.landingService.findByTeam(user, {
      page: +page,
      limit: +limit,
      name,
      template,
      creator
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить лендинг по его id' })
  @ApiParam({ name: 'id', example: 'landing uuid' })
  findOne(@Param('id') id: string) {
    return this.landingService.findOne(id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Создать новый лендинг' })
  @ApiBody({ type: CreateLandingDto })
  @ApiResponse({ status: 201, description: 'Лендинг успешно создан' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@CurrentUser() user: User, @Body() dto: CreateLandingDto) {
    return this.landingService.create(user, dto);
  }

  @Post('preview')
  @ApiOperation({ summary: 'Предпросмотр HTML-версии лендинга' })
  @ApiBody({ type: PreviewDto })
  @ApiResponse({ status: 200, description: 'Возвращает сгенерированный HTML-код' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async preview(@Body() body: PreviewDto, @Res() res: Response) {
    const html = await this.previewService.render(body);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Передать лендинг другому участнику команды' })
  @ApiBody({
    schema: {
      example: {
        landingId: 'uuid-лендинга',
        targetUserId: 'uuid-пользователя'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Лендинг передан' })
  async transferLanding(
    @CurrentUser() user: User,
    @Body() body: { landingId: string; targetUserId: string }
  ) {
    return this.landingService.transferToUser(user, body.landingId, body.targetUserId);
  }

  @Post('duplicate')
  @ApiOperation({ summary: 'Создать копию лендинга (дубликат)' })
  @ApiBody({
    schema: {
      example: {
        landingId: 'uuid-оригинала',
        newName: 'Plinko — копия для FR'
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Копия лендинга успешно создана' })
  async duplicateLanding(
    @CurrentUser() user: User,
    @Body() body: { landingId: string; newName: string }
  ) {
    return this.landingService.duplicate(user, body.landingId, body.newName);
  }

  @Post('delete-many')
  @ApiOperation({ summary: 'Массовое удаление лендингов' })
  @ApiBody({
    schema: {
      example: {
        ids: ['uuid1', 'uuid2', 'uuid3']
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Лендинги успешно удалены' })
  async removeMany(@CurrentUser() user: User, @Body('ids') ids: string[]) {
    return this.landingService.removeMany(user, ids);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить лендинг' })
  @ApiParam({ name: 'id', description: 'ID лендинга' })
  @ApiResponse({ status: 200, description: 'Лендинг успешно удалён' })
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.landingService.remove(user, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Редактировать существующий лендинг' })
  @ApiParam({ name: 'id', description: 'ID лендинга' })
  @ApiBody({ type: EditLandingDto })
  @ApiResponse({ status: 200, description: 'Лендинг успешно обновлён' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: EditLandingDto) {
    return this.landingService.update(user, id, dto);
  }
}
