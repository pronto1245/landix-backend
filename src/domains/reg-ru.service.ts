import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RegRuService {
  private readonly baseUrl = 'https://api.reg.ru/api/regru2';

  private get creds() {
    return {
      username: process.env.REGRU_USERNAME,
      password: process.env.REGRU_PASSWORD
    };
  }

  async checkAvailability(domain: string): Promise<boolean> {
    const url = `${this.baseUrl}/domain/check`;

    if (this.creds.password == null || this.creds.username == null)
      throw new BadRequestException('REG.RU: Не заданы логин/пароль');

    const body = new URLSearchParams();
    body.append('username', this.creds.username);
    body.append('password', this.creds.password);
    body.append('domain_name', domain);
    body.append('output_format', 'json');

    const res = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const item = res.data?.answer?.domains?.[0];
    if (!item) throw new BadRequestException('REG.RU: Некорректный ответ при проверке домена');

    return item.result === 'Available';
  }

  async registerDomain(domain: string): Promise<{ success: boolean; expiresAt: Date }> {
    const url = `${this.baseUrl}/domain/create`;
    const res = await axios.post(url, null, {
      params: {
        ...this.creds,
        domain_name: domain,
        period: 1,
        output_format: 'json'
      }
    });

    const result = res.data?.answer?.domain;
    if (!result || result.result !== 'success') {
      throw new BadRequestException(result?.error || 'REG.RU: Не удалось зарегистрировать домен');
    }

    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    return { success: true, expiresAt: expires };
  }

  async setNameServers(domain: string, nsList: string[]): Promise<boolean> {
    const url = `${this.baseUrl}/domain/nameservers/set`;
    const res = await axios.post(url, null, {
      params: {
        ...this.creds,
        domain_name: domain,
        ns_list: nsList.join(','),
        output_format: 'json'
      }
    });

    if (res.data?.answer?.result !== 'success') {
      throw new BadRequestException('REG.RU: Не удалось установить NS-записи');
    }

    return true;
  }
}
