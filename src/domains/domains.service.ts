// src/domains/domains.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FinanceTransaction } from 'src/crypto/entities/finance-transaction.entity';
import { Team } from 'src/team/entities/team.entity';
import { Repository } from 'typeorm';

import { CloudflareService } from './cloudflare/cloudflare.service';
import { CheckDomainDto } from './dto/check-domain.dto';
import { PurchaseDomainDto } from './dto/purchase-domain.dto';
import { Domain } from './entities/domain.entity';
import { NamecheapClient } from './namecheap/namecheap.client';

@Injectable()
export class DomainsService {
  constructor(
    @InjectRepository(Domain)
    private readonly repo: Repository<Domain>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    private readonly namecheap: NamecheapClient,
    private readonly cloudflare: CloudflareService
  ) {}

  /** Проверка доступности домена */
  async checkDomain(dto: CheckDomainDto) {
    const result = await this.namecheap.checkDomain(dto.name);
    if (result.error) throw new BadRequestException(result.error);
    return result;
  }

  /** Подбор доступных вариантов домена */
  async getDomainSuggestions(name: string) {
    return await this.namecheap.getDomainSuggestions(name);
  }

  /** Покупка домена и подключение к Cloudflare */
  async purchaseDomain(teamId: string, dto: PurchaseDomainDto) {
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['balance']
    });
    if (!team) throw new BadRequestException('Команда не найдена');

    const tld = dto.domainName.split('.').pop()?.toLowerCase();
    if (!tld) throw new BadRequestException('Введите корректное имя');

    const check = await this.namecheap.checkDomain(dto.domainName);
    if (!check.available) throw new BadRequestException('Домен занят');

    const TLD_PRICES: Record<string, { register: number; renewal: number }> = {
      shop: { register: 0.98, renewal: 48.98 },
      online: { register: 0.98, renewal: 28.98 },
      space: { register: 0.98, renewal: 25.98 }
    };

    const price = TLD_PRICES[tld]?.register ?? 1;
    if (team.balance.amount < price) {
      throw new BadRequestException('Недостаточно средств на балансе команды');
    }

    // 💾 1. Списываем деньги и создаём черновик домена
    const draftDomain = await this.repo.manager.transaction(async (em) => {
      team.balance.amount -= price;
      await em.save(team.balance);

      const domain = em.create(Domain, {
        name: dto.domainName,
        status: 'pending',
        provider: 'namecheap',
        priceUsd: price,
        team: { id: teamId }
      });
      return await em.save(domain);
    });

    let purchaseResult: any;
    try {
      // 🌍 2. Реальная покупка домена у Namecheap
      purchaseResult = await this.namecheap.purchaseDomain(dto.domainName, dto.years ?? 1);
      if (!purchaseResult.success) {
        throw new Error(purchaseResult.error || 'Ошибка при покупке домена');
      }

      // 🌐 3. Настройка DNS в Namecheap
      await this.namecheap.setHosts(dto.domainName, [
        { HostName: '@', RecordType: 'A', Address: process.env.CF_SERVER_IP || '45.67.57.148' },
        { HostName: 'www', RecordType: 'CNAME', Address: '@' }
      ]);

      // ☁️ 4. Интеграция с Cloudflare
      try {
        let zoneId = await this.cloudflare.getZoneId(dto.domainName);
        if (!zoneId) {
          zoneId = await this.cloudflare.createZone(dto.domainName);
        }

        await this.cloudflare.upsertRecord(
          zoneId,
          'A',
          dto.domainName,
          process.env.CF_SERVER_IP || '45.67.57.148'
        );

        await this.cloudflare.upsertRecord(
          zoneId,
          'CNAME',
          `www.${dto.domainName}`,
          dto.domainName
        );
      } catch (cfError: any) {
        console.warn(`⚠️ Cloudflare sync failed: ${cfError.message}`);
      }

      // 💾 5. Фиксируем покупку
      await this.repo.manager.transaction(async (em) => {
        await em.update(Domain, draftDomain.id, {
          status: 'purchased',
          expiresAt: purchaseResult.expiresAt
        });

        const payment = em.create(FinanceTransaction, {
          team: { id: teamId },
          amount: -price,
          type: 'domain_purchase',
          description: `Покупка домена ${dto.domainName}`
        });
        await em.save(payment);
      });
    } catch (error: any) {
      // 🔁 Если что-то пошло не так — возвращаем деньги и помечаем домен как failed
      await this.repo.manager.transaction(async (em) => {
        team.balance.amount += price;
        await em.save(team.balance);
        await em.update(Domain, draftDomain.id, { status: 'failed' });
      });

      throw new BadRequestException(`Не удалось купить домен: ${error.message}`);
    }

    // ✅ Успешный ответ
    return {
      success: true,
      message: 'Домен успешно куплен и подключён к Cloudflare',
      data: {
        ...draftDomain,
        status: 'purchased',
        expiresAt: purchaseResult.expiresAt
      }
    };
  }

  /** Получить все домены команды */
  async getAll(teamId: string) {
    if (!teamId) throw new NotFoundException('Команда не найдена');
    return this.repo.find({
      where: { team: { id: teamId } },
      order: { createdAt: 'DESC' }
    });
  }

  /** Получить информацию о домене */
  async getInfo(name: string) {
    return this.namecheap.getInfo(name);
  }
}
