import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);

  private services = [
    (ip: string) => `http://ipwho.is/${ip}`,
    (ip: string) => `https://api.ip.sb/geoip/${ip}`,
    (ip: string) => `https://api.db-ip.com/v2/free/${ip}`
  ];

  private extractCountry(data: any): string | undefined {
    if (!data) return undefined;

    if (data.country_code) return data.country_code.toUpperCase();

    if (data.countryCode) return data.countryCode.toUpperCase();

    return undefined;
  }

  async getCountry(ip?: string): Promise<string | undefined> {
    if (!ip) return undefined;

    for (const buildUrl of this.services) {
      const url = buildUrl(ip);

      try {
        const res = await fetch(url);
        const data = await res.json();
        const country = this.extractCountry(data);

        if (country) {
          this.logger.log(`GEO OK [${ip}] = ${country} via ${url}`);
          return country;
        }
      } catch {
        this.logger.warn(`GEO FAIL via ${url}`);
      }
    }

    return undefined;
  }
}
