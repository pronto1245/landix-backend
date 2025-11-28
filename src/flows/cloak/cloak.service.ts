import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

import { Flow } from '../entities/flow.entity';

@Injectable()
export class CloakService {
  constructor(private readonly logger = new Logger(CloakService.name)) {}

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

  private async getGeo(ip?: string): Promise<string | undefined> {
    if (!ip) return;

    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await res.json();
      return data?.country?.toUpperCase();
    } catch {
      return undefined;
    }
  }

  async check(req: Request, cloak?: Flow['cloak']) {
    const ip = this.getClientIp(req);
    const ua = (req.headers['user-agent'] as string) || '';
    const country = await this.getGeo(ip);

    this.logger.log({
      step: 'incoming',
      ip,
      ua,
      country,
      cloak
    });

    if (!cloak?.enabled) {
      this.logger.log({ step: 'disabled -> pass' });
      return { passed: true, ip, country };
    }

    // BOT
    if (cloak.blockBots && (!ua || this.botRegex.some((r) => r.test(ua)))) {
      this.logger.log({ step: 'bot-detected', reason: 'bot', ip, ua });
      return { passed: false, reason: 'bot', ip, country };
    }

    // GEO
    if (cloak.allowedCountry) {
      if (!country) {
        this.logger.log({ step: 'geo-fail', reason: 'geo_unavailable', ip });
        return { passed: false, reason: 'geo_unavailable', ip };
      }

      if (country !== cloak.allowedCountry.toUpperCase()) {
        this.logger.log({
          step: 'geo_not_allowed',
          expected: cloak.allowedCountry,
          actual: country
        });
        return {
          passed: false,
          reason: `geo_not_allowed: ${country}`,
          ip,
          country
        };
      }
    }

    this.logger.log({ step: 'passed', ip, country });
    return { passed: true, ip, country };
  }
}
