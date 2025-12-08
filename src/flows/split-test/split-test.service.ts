import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Landing } from 'src/landing/entities/landing.entity';
import { RedisService } from 'src/redis/redis.service';
import { Repository } from 'typeorm';

import { Flow } from '../entities/flow.entity';

interface NormalizedVariant {
  landingId: string;
  weight: number;
}

@Injectable()
export class SplitTestService {
  private readonly logger = new Logger(SplitTestService.name);
  private readonly redis;

  private readonly CACHE_TTL = 30 * 24 * 3600;

  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(Landing)
    private readonly landingRepo: Repository<Landing>
  ) {
    this.redis = this.redisService.getClient();
  }

  async pickLandingForFlow(flow: Flow, ip?: string): Promise<Landing | null> {
    if (!flow.splitTest?.enabled || !flow.splitTest.variants?.length) {
      return null;
    }

    const variants = this.normalizeVariants(flow);

    if (!variants.length) {
      this.logger.warn(`Flow ${flow.id}: no valid split variants after normalization`);
      return null;
    }

    const cacheKey = this.buildCacheKey(flow.id, ip);

    const cachedLandingId = await this.redis.get(cacheKey);
    if (cachedLandingId) {
      const cachedLanding = await this.landingRepo.findOne({ where: { id: cachedLandingId } });
      if (cachedLanding) {
        return cachedLanding;
      }
      await this.redis.del(cacheKey);
    }

    const selectedLandingId = this.pickVariantByWeight(variants);

    if (!selectedLandingId) {
      return null;
    }

    if (ip) {
      await this.redis.set(cacheKey, selectedLandingId, 'EX', this.CACHE_TTL);
    }

    const landing = await this.landingRepo.findOne({
      where: { id: selectedLandingId }
    });

    if (!landing) {
      this.logger.warn(
        `Flow ${flow.id}: selected split landing ${selectedLandingId} not found in DB`
      );
      return null;
    }

    return landing;
  }

  private buildCacheKey(flowId: string, ip?: string) {
    return `split:${flowId}:${ip || 'noip'}`;
  }

  private normalizeVariants(flow: Flow): NormalizedVariant[] {
    const raw = flow.splitTest?.variants ?? [];

    const variants: NormalizedVariant[] = raw
      .map((v) => ({
        landingId: v.landingId,
        weight: Number(v.weight) || 0
      }))
      .filter((v) => v.landingId && v.weight > 0);

    return variants;
  }

  private pickVariantByWeight(variants: NormalizedVariant[]): string | null {
    const total = variants.reduce((s, v) => s + v.weight, 0);

    if (total <= 0) {
      return null;
    }

    let rnd = Math.random() * total;

    for (const v of variants) {
      if (rnd < v.weight) {
        this.logger.debug(
          `Split chosen landing ${v.landingId} (weight=${v.weight}, total=${total})`
        );
        return v.landingId;
      }
      rnd -= v.weight;
    }

    return variants[variants.length - 1]?.landingId ?? null;
  }

  async clearCacheForFlow(flowId: string) {
    const pattern = `split:${flowId}:*`;
    const keys = await this.redis.keys(pattern);

    if (keys.length) {
      await this.redis.del(...keys);
      this.logger.log(`🧽 Cleared split-test cache for flow ${flowId} (${keys.length} keys)`);
    }
  }
}
