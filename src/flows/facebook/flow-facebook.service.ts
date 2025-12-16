import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Buffer } from 'node:buffer';
import * as crypto from 'node:crypto';
import { Repository } from 'typeorm';

import { Flow } from '../entities/flow.entity';
import { UpdateFlowFacebookDto } from './dto/update-flow-facebook.dto';
import { FlowFacebookPixel } from './entities/flow-facebook-pixel.entity';

@Injectable()
export class FlowFacebookService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey = Buffer.from(process.env.FACEBOOK_TOKEN_SECRET!, 'hex');

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

    const pixelIds = dto.facebook.map((item) => item.pixelId.trim());

    const duplicates = pixelIds.filter((id, index) => pixelIds.indexOf(id) !== index);

    if (duplicates.length > 0) {
      throw new BadRequestException(`Пиксели с такими ID уже существуют`);
    }

    await this.pixelRepository.delete({ flowId });

    const entities = dto.facebook.map((item) =>
      this.pixelRepository.create({
        flowId,
        pixelId: item.pixelId.trim(),
        token: this.encrypt(item.token),
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
      token: this.decrypt(row.token),
      isActive: row.isActive
    }));
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  private decrypt(encryptedText: string): string {
    const data = Buffer.from(encryptedText, 'base64');

    const iv = data.subarray(0, 12);
    const authTag = data.subarray(12, 28);
    const encrypted = data.subarray(28);

    const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }
}
