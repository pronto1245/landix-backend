import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { Flow } from '../entities/flow.entity';
import { GeoService } from './geo.service';

@Injectable()
export class CloakService {
  constructor(private readonly geo: GeoService) {}

  private botRegex = [
    /bot/i,
    /spider/i,
    /crawl/i,
    /facebookexternalhit/i,
    /AdsBot/i,
    /Google-InspectionTool/i
  ];

  private getClientIp(req: Request): string | undefined {
    return (
      (req.headers['cf-connecting-ip'] as string) ||
      (req.headers['x-real-ip'] as string) ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip
    );
  }

  async check(req: Request, cloak?: Flow['cloak']) {
    const ip = this.getClientIp(req);
    const ua = req.headers['user-agent'] || null;

    const country = await this.geo.getCountry(ip);

    if (!cloak?.enabled) {
      return { passed: true, ip, country };
    }

    if (cloak.blockBots) {
      if (!ua) {
        return { passed: false, reason: 'bot', ip, country };
      }

      if (this.botRegex.some((r) => r.test(ua))) {
        return { passed: false, reason: 'bot', ip, country };
      }
    }

    if (cloak.allowedCountry) {
      const allowed = cloak.allowedCountry.toUpperCase();

      if (!country) {
        return { passed: false, reason: 'geo_unavailable', ip };
      }

      if (country !== allowed) {
        return {
          passed: false,
          reason: `geo_not_allowed:${country}`,
          ip,
          country
        };
      }
    }

    return { passed: true, ip, country };
  }
}
