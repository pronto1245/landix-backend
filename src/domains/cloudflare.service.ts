import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CloudflareService {
  private readonly baseUrl = 'https://api.cloudflare.com/client/v4';

  private get headers() {
    return {
      Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
      'Content-Type': 'application/json'
    };
  }

  async createZone(domain: string): Promise<string> {
    const res = await axios.post(
      `${this.baseUrl}/zones`,
      {
        name: domain,
        jump_start: false
      },
      { headers: this.headers }
    );

    return res.data.result.id;
  }

  async addARecord(zoneId: string, ip: string): Promise<boolean> {
    const res = await axios.post(
      `${this.baseUrl}/zones/${zoneId}/dns_records`,
      {
        type: 'A',
        name: '@',
        content: ip,
        ttl: 120,
        proxied: true
      },
      { headers: this.headers }
    );

    return res.data.success;
  }

  async getZoneId(domain: string): Promise<string | null> {
    const res = await axios.get(`${this.baseUrl}/zones?name=${domain}`, { headers: this.headers });

    const zone = res.data.result?.[0];
    return zone?.id || null;
  }
}
