import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

      const parsed = await parseStringPromise(response.data, { explicitArray: false });

      const apiStatus = parsed?.ApiResponse?.$.Status;
      const apiError = parsed?.ApiResponse?.Errors?.Error;

      if (apiStatus !== 'OK') {
        throw new HttpException(
          `Namecheap API error: ${apiError?._ || apiError || 'Unknown error'}`,
          HttpStatus.BAD_GATEWAY
        );
      }

      const result = parsed?.ApiResponse?.CommandResponse?.DomainCheckResult?.$;
      if (!result) {
        throw new HttpException('Некорректный ответ от Namecheap API', HttpStatus.BAD_GATEWAY);
      }

      return {
        domain: result.Domain,
        available: result.Available === 'true',
        premium: result.IsPremiumName === 'true',
        error: null
      };
    } catch (err: any) {
      throw new HttpException(
        `Ошибка при обращении к Namecheap API: ${err.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async getDomainSuggestions(base: string) {
    if (!base || base.length < 3) {
      throw new BadRequestException('Введите корректное имя');
    }

    const zones = ['shop', 'online', 'space'];

    const TLD_PRICES: Record<string, { register: number; renewal: number }> = {
      shop: { register: 0.98, renewal: 48.98 },
      online: { register: 0.98, renewal: 28.98 },
      space: { register: 0.98, renewal: 25.98 }
    };

    const domainList = zones.map((zone) => `${base}.${zone}`).join(',');

    const response = await axios.get(this.baseUrl, {
      params: {
        ApiUser: this.apiUser,
        ApiKey: this.apiKey,
        UserName: this.userName,
        ClientIp: this.clientIp,
        Command: 'namecheap.domains.check',
        DomainList: domainList
      }
    });

    const parsed = await parseStringPromise(response.data, { explicitArray: false });
    const results = parsed?.ApiResponse?.CommandResponse?.DomainCheckResult;
    const list = Array.isArray(results) ? results : [results];

    const data = list.map((item: any) => {
      const tld = item.$.Domain.split('.').pop().toLowerCase();
      const premium = item.$.IsPremiumName === 'true';
      const price =
        premium && Number(item.$.PremiumRegistrationPrice) > 0
          ? Number(item.$.PremiumRegistrationPrice)
          : (TLD_PRICES[tld]?.register ?? null);
      const renewalPrice =
        premium && Number(item.$.PremiumRenewalPrice) > 0
          ? Number(item.$.PremiumRenewalPrice)
          : (TLD_PRICES[tld]?.renewal ?? null);

      return {
        domain: item.$.Domain,
        available: item.$.Available === 'true',
        premium,
        priceUsd: price,
        renewalUsd: renewalPrice
      };
    });

    return data;
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

          // --- REGISTRANT ---
          RegistrantFirstName: 'Landix',
          RegistrantLastName: 'Team',
          RegistrantAddress1: 'Landix Platform',
          RegistrantCity: 'Moscow',
          RegistrantStateProvince: 'Moscow',
          RegistrantPostalCode: '101000',
          RegistrantCountry: 'RU',
          RegistrantPhone: '+1.2025550112',
          RegistrantEmailAddress: 'no-reply@landix.group',

          // --- ADMIN ---
          AdminFirstName: 'Landix',
          AdminLastName: 'Admin',
          AdminAddress1: 'Landix Platform',
          AdminCity: 'Moscow',
          AdminStateProvince: 'Moscow',
          AdminPostalCode: '101000',
          AdminCountry: 'RU',
          AdminPhone: '+1.2025550112',
          AdminEmailAddress: 'no-reply@landix.group',

          // --- TECH ---
          TechFirstName: 'Landix',
          TechLastName: 'Tech',
          TechAddress1: 'Landix Platform',
          TechCity: 'Moscow',
          TechStateProvince: 'Moscow',
          TechPostalCode: '101000',
          TechCountry: 'RU',
          TechPhone: '+1.2025550112',
          TechEmailAddress: 'no-reply@landix.group',

          // --- BILLING ---
          AuxBillingFirstName: 'Landix',
          AuxBillingLastName: 'Billing',
          AuxBillingAddress1: 'Landix Platform',
          AuxBillingCity: 'Moscow',
          AuxBillingStateProvince: 'Moscow',
          AuxBillingPostalCode: '101000',
          AuxBillingCountry: 'RU',
          AuxBillingPhone: '+1.2025550112',
          AuxBillingEmailAddress: 'no-reply@landix.group'
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
