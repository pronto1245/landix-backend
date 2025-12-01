import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

import { Flow } from '../entities/flow.entity';
import { GeoService } from './geo.service';

@Injectable()
export class CloakService {
  private readonly logger = new Logger(CloakService.name);

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

    this.logger.log({
      ip: req.ip,
      cf: req.headers['cf-connecting-ip'],
      real: req.headers['x-real-ip'],
      fwd: req.headers['x-forwarded-for']
    });

    const country = await this.geo.getCountry(ip);

    this.logger.log({
      event: 'incoming',
      ip,
      ua,
      country,
      cloak
    });

    if (!cloak?.enabled) {
      this.logger.log({ event: 'cloak_disabled', passed: true });
      return { passed: true, ip, country };
    }

    if (cloak.blockBots) {
      if (!ua) {
        this.logger.warn({
          event: 'bot_rejected',
          reason: 'empty_user_agent',
          ip,
          ua
        });
        return { passed: false, reason: 'bot', ip, country };
      }

      if (this.botRegex.some((r) => r.test(ua))) {
        this.logger.warn({
          event: 'bot_rejected',
          reason: 'bot_regex',
          ip,
          ua
        });
        return { passed: false, reason: 'bot', ip, country };
      }
    }

    if (cloak.allowedCountry) {
      const allowed = cloak.allowedCountry.toUpperCase();

      if (!country) {
        this.logger.warn({
          event: 'geo_fail',
          reason: 'geo_unavailable',
          ip
        });
        return { passed: false, reason: 'geo_unavailable', ip };
      }

      if (country !== allowed) {
        this.logger.warn({
          event: 'geo_not_allowed',
          expected: allowed,
          actual: country,
          ip
        });
        return {
          passed: false,
          reason: `geo_not_allowed:${country}`,
          ip,
          country
        };
      }
    }

    this.logger.log({
      event: 'passed',
      ip,
      country
    });

    return { passed: true, ip, country };
  }
}
