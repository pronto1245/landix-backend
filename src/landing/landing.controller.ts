import type { Response } from 'express';

import { Body, Controller, Post, Res, UsePipes, ValidationPipe } from '@nestjs/common';

import { PreviewDto } from './dto/preview.dto';
import { LandingService } from './landing.service';
import { PreviewService } from './preview.service';

@Controller('landing')
export class LandingController {
  constructor(
    private readonly landingService: LandingService,
    private readonly previewService: PreviewService
  ) {}

  @Post('preview')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async preview(@Body() body: PreviewDto, @Res() res: Response) {
    const html = await this.previewService.render(body);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
