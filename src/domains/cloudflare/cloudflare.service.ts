import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CloudflareService {
  private readonly baseUrl = 'https://api.cloudflare.com/client/v4';
  private readonly logger = new Logger(CloudflareService.name);

  private getHeaders(apiToken?: string) {
    const token = apiToken || process.env.CF_API_TOKEN;
    if (!token) throw new BadRequestException('Cloudflare API token not provided');

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getZoneId(domain: string, apiToken?: string): Promise<string | null> {
    try {
      const res = await axios.get(`${this.baseUrl}/zones?name=${domain}`, {
        headers: this.getHeaders(apiToken)
      });
      if (res.data.success && res.data.result.length > 0) {
        return res.data.result[0].id;
      }
      return null;
    } catch (err: any) {
      this.logger.warn(`getZoneId failed: ${err.message}`);
      return null;
    }
  }

  async createZone(
    domain: string,
    apiToken?: string,
    accountId?: string
  ): Promise<{ id: string; name_servers: string[] }> {
    try {
      const res = await axios.post(
        `${this.baseUrl}/zones`,
        {
          name: domain.trim().replace(/^www\./, ''),
          account: { id: accountId || process.env.CF_ACCOUNT_ID },
          jump_start: true
        },
        { headers: this.getHeaders(apiToken) }
      );

      if (!res.data.success) {
        throw new HttpException(
          `Cloudflare API error: ${res.data.errors?.[0]?.message || 'Unknown error'}`,
          502
        );
      }

      const result = res.data.result;
      this.logger.log(`✅ Zone created: ${domain} (${result.id})`);
      return { id: result.id, name_servers: result.name_servers };
    } catch (err: any) {
      if (err.response?.data) {
        this.logger.error(
          '❌ Cloudflare API response:',
          JSON.stringify(err.response.data, null, 2)
        );
      }
      throw new HttpException(`Ошибка при создании зоны: ${err.message}`, 502);
    }
  }

  async getZoneInfo(zoneId: string, apiToken?: string) {
    const res = await axios.get(`${this.baseUrl}/zones/${zoneId}`, {
      headers: this.getHeaders(apiToken)
    });
    return res.data.result;
  }

  async upsertRecord(
    zoneId: string,
    type: string,
    name: string,
    content: string,
    apiToken?: string
  ) {
    try {
      const existing = await axios.get(
        `${this.baseUrl}/zones/${zoneId}/dns_records?type=${type}&name=${name}`,
        { headers: this.getHeaders(apiToken) }
      );

      if (existing.data.result.length > 0) {
        const recordId = existing.data.result[0].id;
        await axios.put(
          `${this.baseUrl}/zones/${zoneId}/dns_records/${recordId}`,
          { type, name, content, ttl: 1, proxied: true },
          { headers: this.getHeaders(apiToken) }
        );
        this.logger.log(`♻️ Обновлена запись ${type} ${name} → ${content}`);
      } else {
        await axios.post(
          `${this.baseUrl}/zones/${zoneId}/dns_records`,
          { type, name, content, ttl: 1, proxied: true },
          { headers: this.getHeaders(apiToken) }
        );
        this.logger.log(`🆕 Создана запись ${type} ${name} → ${content}`);
      }
    } catch (err: any) {
      throw new HttpException(`Ошибка при upsert DNS: ${err.message}`, 502);
    }
  }
}
