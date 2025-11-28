import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { Flow } from '../entities/flow.entity';
import { CloakResult } from './cloak.types';

@Injectable()
export class CloakService {
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

  async check(req: Request, cloak?: Flow['cloak']): Promise<CloakResult> {
    if (!cloak?.enabled) {
      return { passed: true };
    }

    const ua = (req.headers['user-agent'] as string) || '';

    if (cloak.blockBots && !ua) {
      return { passed: false, reason: 'empty-user-agent' };
    }

    if (cloak.blockBots && this.botRegex.some((r) => r.test(ua))) {
      return { passed: false, reason: 'bot-matched' };
    }

    const ip = this.getClientIp(req);
    const country = (await this.getGeo(ip))?.toUpperCase();

    if (cloak.allowedCountries?.length) {
      if (!country) {
        return { passed: false, reason: 'geo_unavailable', ip };
      }

      if (!cloak.allowedCountries.includes(country)) {
        return {
          passed: false,
          reason: `geo_not_allowed: ${country}`,
          country,
          ip
        };
      }
    }

    if (cloak.bannedCountries?.length && country) {
      if (cloak.bannedCountries.includes(country)) {
        return {
          passed: false,
          reason: `banned_geo: ${country}`,
          country,
          ip
        };
      }
    }

    return { passed: true, country, ip };
  }
}
