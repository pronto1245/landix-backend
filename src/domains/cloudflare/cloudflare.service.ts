// src/domains/cloudflare.service.ts
import { HttpException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CloudflareService {
  private readonly baseUrl = 'https://api.cloudflare.com/client/v4';
  private readonly logger = new Logger(CloudflareService.name);

  constructor() {}

  private get headers() {
    return {
      Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
      'Content-Type': 'application/json'
    };
  }

  /** 🔍 Получить zone_id по имени домена */
  async getZoneId(domain: string): Promise<string | null> {
    try {
      const res = await axios.get(`${this.baseUrl}/zones?name=${domain}`, {
        headers: this.headers
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

  /** 🆕 Создать зону (домен) в Cloudflare */
  async createZone(domain: string): Promise<string> {
    try {
      const res = await axios.post(
        `${this.baseUrl}/zones`,
        {
          name: domain.trim().replace(/^www\./, ''), // чистим домен
          account: { id: process.env.CF_ACCOUNT_ID },
          jump_start: true
        },
        { headers: this.headers }
      );

      if (!res.data.success) {
        this.logger.error('Cloudflare error details:', res.data.errors);
        throw new HttpException(
          `Cloudflare API error: ${res.data.errors?.[0]?.message || 'Unknown error'}`,
          502
        );
      }

      const zoneId = res.data.result.id;
      this.logger.log(`✅ Zone created: ${domain} (${zoneId})`);
      return zoneId;
    } catch (err: any) {
      // 👉 логируем полный ответ Cloudflare
      if (err.response?.data) {
        this.logger.error(
          '❌ Cloudflare API response:',
          JSON.stringify(err.response.data, null, 2)
        );
      }
      throw new HttpException(`Ошибка при создании зоны в Cloudflare: ${err.message}`, 502);
    }
  }

  /** 📜 Добавить или обновить DNS-запись */
  async upsertRecord(zoneId: string, type: string, name: string, content: string) {
    try {
      const existing = await axios.get(
        `${this.baseUrl}/zones/${zoneId}/dns_records?type=${type}&name=${name}`,
        { headers: this.headers }
      );

      if (existing.data.result.length > 0) {
        const recordId = existing.data.result[0].id;
        await axios.put(
          `${this.baseUrl}/zones/${zoneId}/dns_records/${recordId}`,
          { type, name, content, ttl: 1, proxied: false },
          { headers: this.headers }
        );
        this.logger.log(`♻️ Обновлена запись ${type} ${name} → ${content}`);
      } else {
        await axios.post(
          `${this.baseUrl}/zones/${zoneId}/dns_records`,
          { type, name, content, ttl: 1, proxied: false },
          { headers: this.headers }
        );
        this.logger.log(`🆕 Создана запись ${type} ${name} → ${content}`);
      }
    } catch (err: any) {
      throw new HttpException(`Ошибка при upsert DNS: ${err.message}`, 502);
    }
  }
}
