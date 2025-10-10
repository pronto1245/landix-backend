import type { Response } from 'express';

import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

import { CreateLandingDto } from './dto/create-landing.dto';
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

  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@CurrentUser() user: User, @Body() dto: CreateLandingDto) {
    return this.landingService.create(user, dto);
  }

  @Get('')
  async list(@CurrentUser() user: User) {
    return this.landingService.findByTeam(user);
  }

  @Post('preview')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async preview(@Body() body: PreviewDto, @Res() res: Response) {
    const html = await this.previewService.render(body);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
