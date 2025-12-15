import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Flow } from '../entities/flow.entity';
import { UpdateFlowFacebookDto } from './dto/update-flow-facebook.dto';
import { FlowFacebookPixel } from './entities/flow-facebook-pixel.entity';

@Injectable()
export class FlowFacebookService {
  constructor(
    @InjectRepository(Flow)
    private readonly flowRepository: Repository<Flow>,

    @InjectRepository(FlowFacebookPixel)
    private readonly pixelRepository: Repository<FlowFacebookPixel>
  ) {}

  async update(flowId: string, dto: UpdateFlowFacebookDto) {
    const flow = await this.flowRepository.findOne({
      where: { id: flowId }
    });

    if (!flow) {
      throw new NotFoundException('Flow not found');
    }

    await this.pixelRepository.delete({ flowId });

    const entities = dto.facebook.map((item) =>
      this.pixelRepository.create({
        flowId,
        pixelId: item.pixelId,
        token: item.token,
        isActive: true
      })
    );

    await this.pixelRepository.save(entities);

    return { success: true };
  }

  async get(flowId: string) {
    const rows = await this.pixelRepository.find({
      where: { flowId }
    });

    return rows.map((row) => ({
      pixelId: row.pixelId,
      tokenMasked: this.maskToken(row.token),
      isActive: row.isActive
    }));
  }

  private maskToken(token: string): string {
    if (token.length < 10) return '********';
    return `${token.slice(0, 4)}********${token.slice(-4)}`;
  }
}
