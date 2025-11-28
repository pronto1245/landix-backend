import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import fetch from 'node-fetch';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class GeoService implements OnModuleInit {
  private readonly logger = new Logger(GeoService.name);
  private redis;

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    this.redis = this.redisService.getClient();
    this.logger.log('GeoService initialized (Redis connected)');
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

    if (!this.redis) {
      this.logger.error('Redis not initialized yet in GeoService!');
      return undefined;
    }

    const cached = await this.redis.get(redisKey);
    if (cached) {
      this.logger.log(`GEO CACHE HIT [${ip}] = ${cached}`);
      return cached === 'UNKNOWN' ? undefined : cached;
    }

    for (const buildUrl of this.services) {
      const url = buildUrl(ip);

      try {
        const res = await fetch(url);
        const data = await res.json();
        const country = this.extractCountry(data);

        if (country) {
          await this.redis.set(redisKey, country, 'EX', 86400);
          this.logger.log(`GEO SUCCESS [${ip}] = ${country} via ${url}`);
          return country;
        }
      } catch {
        this.logger.warn(`GEO FAIL via ${url}`);
      }
    }

    await this.redis.set(redisKey, 'UNKNOWN', 'EX', 300);
    return undefined;
  }
}
