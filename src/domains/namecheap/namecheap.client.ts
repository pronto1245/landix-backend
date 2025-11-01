import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class NamecheapClient {
  private readonly baseUrl: string;
  private readonly apiUser: string;
  private readonly apiKey: string;
  private readonly userName: string;
  private readonly clientIp: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('NAMECHEAP_BASE_URL') || '';
    this.apiUser = this.config.get<string>('NAMECHEAP_API_USER') || '';
    this.apiKey = this.config.get<string>('NAMECHEAP_API_KEY') || '';
    this.userName = this.config.get<string>('NAMECHEAP_USER_NAME') || this.apiUser;
    this.clientIp = this.config.get<string>('NAMECHEAP_CLIENT_IP') || '';

    if (!this.baseUrl || !this.apiKey || !this.apiUser || !this.clientIp) {
      throw new Error('❌ Namecheap API credentials are not configured properly');
    }
  }

  // 🔍 Проверка доступности домена
  async checkDomain(name: string) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          ApiUser: this.apiUser,
          ApiKey: this.apiKey,
          UserName: this.userName,
          ClientIp: this.clientIp,
          Command: 'namecheap.domains.check',
          DomainList: name
        }
      });

      const parsed = await parseStringPromise(response.data, {
        explicitArray: false
      });

      const result = parsed?.ApiResponse?.CommandResponse?.DomainCheckResult?.$ || null;
      const error =
        parsed?.ApiResponse?.Errors?.Error?._ || parsed?.ApiResponse?.Errors?.Error || null;

      return {
        available: result?.Available === 'true',
        domain: result?.Domain || name,
        error
      };
    } catch (err: any) {
      throw new HttpException(
        `Ошибка при обращении к API Namecheap: ${err.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  // 💳 Покупка домена
  async purchaseDomain(name: string, years = 1) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          ApiUser: this.apiUser,
          ApiKey: this.apiKey,
          UserName: this.userName,
          ClientIp: this.clientIp,
          Command: 'namecheap.domains.create',
          DomainName: name,
          Years: years,
          RegistrantFirstName: 'Landix',
          RegistrantLastName: 'Team',
          RegistrantEmailAddress: 'no-reply@landix.group',
          RegistrantPhone: '+1.2025550112',
          RegistrantAddress1: 'Landix Platform',
          RegistrantCity: 'Moscow',
          RegistrantCountry: 'RU'
        }
      });

      const parsed = await parseStringPromise(response.data, {
        explicitArray: false
      });

      const result = parsed?.ApiResponse?.CommandResponse?.DomainCreateResult?.$ || null;
      const error =
        parsed?.ApiResponse?.Errors?.Error?._ || parsed?.ApiResponse?.Errors?.Error || null;

      return {
        success: result?.Registered === 'true',
        domain: result?.Domain || name,
        expiresAt: result?.ExpiredDate || null,
        error
      };
    } catch (err: any) {
      throw new HttpException(`Ошибка при покупке домена: ${err.message}`, HttpStatus.BAD_GATEWAY);
    }
  }

  // 🌐 Настройка DNS (A-запись / CNAME)
  async setHosts(
    domain: string,
    records: { HostName: string; RecordType: string; Address: string; TTL?: number }[]
  ) {
    try {
      const params: Record<string, any> = {
        ApiUser: this.apiUser,
        ApiKey: this.apiKey,
        UserName: this.userName,
        ClientIp: this.clientIp,
        Command: 'namecheap.domains.dns.setHosts',
        DomainName: domain
      };

      records.forEach((record, index) => {
        const i = index + 1;
        params[`HostName${i}`] = record.HostName;
        params[`RecordType${i}`] = record.RecordType;
        params[`Address${i}`] = record.Address;
        params[`TTL${i}`] = record.TTL || 1800;
      });

      const response = await axios.get(this.baseUrl, { params });
      const parsed = await parseStringPromise(response.data, { explicitArray: false });

      const result = parsed?.ApiResponse?.CommandResponse?.DomainDNSSetHostsResult?.$ || null;
      const error =
        parsed?.ApiResponse?.Errors?.Error?._ || parsed?.ApiResponse?.Errors?.Error || null;

      return {
        success: result?.IsSuccess === 'true',
        domain: result?.Domain || domain,
        error
      };
    } catch (err: any) {
      throw new HttpException(`Ошибка при настройке DNS: ${err.message}`, HttpStatus.BAD_GATEWAY);
    }
  }

  // ℹ️ Получение информации о домене
  async getInfo(name: string) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          ApiUser: this.apiUser,
          ApiKey: this.apiKey,
          UserName: this.userName,
          ClientIp: this.clientIp,
          Command: 'namecheap.domains.getInfo',
          DomainName: name
        }
      });

      const parsed = await parseStringPromise(response.data, {
        explicitArray: false
      });
      return parsed?.ApiResponse?.CommandResponse?.DomainGetInfoResult?.$ || null;
    } catch (err: any) {
      throw new HttpException(
        `Ошибка при получении информации о домене: ${err.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }
}
