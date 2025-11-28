import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class GeoService {
  private redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getClient();
  }

  private services = [
    (ip: string) => `http://ipwho.is/${ip}`,
    (ip: string) => `https://api.ip.sb/geoip/${ip}`,
    (ip: string) => `https://ipapi.is/${ip}`,
    (ip: string) => `https://get.geojs.io/v1/ip/country.json?ip=${ip}`,
    (ip: string) => `https://api.db-ip.com/v2/free/${ip}`
  ];

  private extractCountry(data: any): string | undefined {
    return (
      data?.country?.toUpperCase() ||
      data?.country_code?.toUpperCase() ||
      data?.countryCode?.toUpperCase() ||
      data?.location?.country_code?.toUpperCase() ||
      data?.country_code2?.toUpperCase()
    );
  }

  async getCountry(ip?: string): Promise<string | undefined> {
    if (!ip) return undefined;

    const redisKey = `geo:${ip}`;

    const cached = await this.redis.get(redisKey);
    if (cached) {
      return cached;
    }

    for (const buildUrl of this.services) {
      const url = buildUrl(ip);

      try {
        const res = await fetch(url);
        const data = await res.json();
        const country = this.extractCountry(data);

        if (country) {
          await this.redis.set(redisKey, country, 'EX', 86400);
          return country;
        }
      } catch {
        continue;
      }
    }

    await this.redis.set(redisKey, 'UNKNOWN', 'EX', 300);
    return undefined;
  }
}
