import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { FinanceTransaction } from 'src/crypto/entities/finance-transaction.entity';
import { CreateFlowWithDomainDto } from 'src/flows/dto/create-flow-with-domain.dto';
import { Flow } from 'src/flows/entities/flow.entity';
import { Team } from 'src/team/entities/team.entity';
import { Repository } from 'typeorm';
import { parseStringPromise } from 'xml2js';

import { CloudflareService } from './cloudflare/cloudflare.service';
import { CreateCloudflareAccountDto } from './dto/create-cloudflare-account.dto';
import { PurchaseDomainDto } from './dto/purchase-domain.dto';
import { CloudflareAccount } from './entities/cloudflare-account.entity';
import { Domain } from './entities/domain.entity';
import { NamecheapClient } from './namecheap/namecheap.client';

@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name);

  constructor(
    @InjectRepository(Domain)
    private readonly repo: Repository<Domain>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(Flow)
    private readonly flowRepo: Repository<Flow>,
    @InjectRepository(CloudflareAccount)
    private readonly cloudflareAccountRepo: Repository<CloudflareAccount>,
    private readonly namecheap: NamecheapClient,
    private readonly cloudflare: CloudflareService
  ) {}

  async getDomainSuggestions(name: string) {
    return await this.namecheap.getDomainSuggestions(name);
  }

  async getSystemDomains() {
    return this.repo.find({
      where: {
        provider: 'system',
        status: 'available'
      },
      order: { createdAt: 'DESC' }
    });
  }

  async getPurchasedDomains(teamId: string) {
    return this.repo.find({
      where: {
        provider: 'namecheap',
        status: 'purchased',
        team: { id: teamId }
      },
      order: { createdAt: 'DESC' }
    });
  }

  async syncSystemDomainsFromNamecheap() {
    const res = await axios.get(this.namecheap.getBaseUrl(), {
      params: {
        ApiUser: this.namecheap.getApiUser(),
        ApiKey: this.namecheap.getApiKey(),
        UserName: this.namecheap.getUserName(),
        ClientIp: this.namecheap.getClientIp(),
        Command: 'namecheap.domains.getList'
      }
    });

    const parsed = await parseStringPromise(res.data, { explicitArray: false });

    const list = parsed?.ApiResponse?.CommandResponse?.DomainGetListResult?.Domain || [];
    const domains = Array.isArray(list) ? list : [list];

    const TLD_PRICES: Record<string, { register: number; renewal: number }> = {
      shop: { register: 0.98, renewal: 48.98 },
      online: { register: 0.98, renewal: 28.98 },
      space: { register: 0.98, renewal: 25.98 }
    };

    const added: Domain[] = [];
    const updated: Domain[] = [];

    for (const d of domains) {
      const name = d.$.Name;
      const expiresAt = d.$.Expires ? new Date(d.$.Expires) : null;

      const tld = name.split('.').pop()?.toLowerCase();
      const priceUsd = TLD_PRICES[tld]?.register;

      let domain = await this.repo.findOne({
        where: { name },
        relations: ['team']
      });

      if (domain && domain.provider === 'namecheap') {
        continue;
      }

      if (domain && domain.flowId) {
        continue;
      }

      if (!domain) {
        domain = this.repo.create({
          name,
          provider: 'system',
          status: 'available',
          team: null,
          priceUsd,
          expiresAt
        });

        await this.repo.save(domain);
        added.push(domain);
        continue;
      }

      domain.provider = 'system';
      domain.team = null;
      domain.flowId = null;
      domain.status = 'available';
      domain.expiresAt = expiresAt;
      domain.priceUsd = priceUsd;

      await this.repo.save(domain);
      updated.push(domain);
    }

    return {
      success: true,
      added,
      updated,
      message: 'Системные домены синхронизированы'
    };
  }

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

    const draft = await this.repo.manager.transaction(async (em) => {
      team.balance.amount -= price;
      await em.save(team.balance);

      const domain = em.create(Domain, {
        name: dto.domainName,
        provider: 'namecheap',
        status: 'pending',
        priceUsd: price,
        team: { id: teamId }
      });

      return await em.save(domain);
    });

    try {
      const purchaseRes = await this.namecheap.purchaseDomain(dto.domainName, dto.years ?? 1);
      if (!purchaseRes.success) throw new Error(purchaseRes.error || 'Ошибка Namecheap');

      await this.namecheap.setHosts(dto.domainName, [
        { HostName: '@', RecordType: 'A', Address: process.env.CF_SERVER_IP || '' },
        { HostName: 'www', RecordType: 'CNAME', Address: '@' }
      ]);

      const zone = await this.cloudflare.createZone(dto.domainName);

      const nsRecords = zone.name_servers;

      await this.namecheap.setCustomNameservers(dto.domainName, nsRecords);

      await this.cloudflare.upsertRecord(
        zone.id,
        'A',
        dto.domainName,
        process.env.CF_SERVER_IP || ''
      );
      await this.cloudflare.upsertRecord(zone.id, 'CNAME', `www.${dto.domainName}`, dto.domainName);

      await this.repo.update(draft.id, {
        status: 'purchased',
        expiresAt: purchaseRes.expiresAt,
        nsRecords
      });

      return {
        message: 'Домен успешно куплен и настроен',
        data: {
          ...draft,
          status: 'purchased',
          expiresAt: purchaseRes.expiresAt,
          nsRecords
        }
      };
    } catch (e: any) {
      await this.repo.manager.transaction(async (em) => {
        team.balance.amount += price;
        await em.save(team.balance);
        await em.update(Domain, draft.id, { status: 'failed' });
      });

      throw new BadRequestException(`Ошибка покупки домена: ${e.message}`);
    }
  }

  async attachDomainToFlow(teamId: string, flow: Flow, dto: CreateFlowWithDomainDto) {
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['balance']
    });

    if (!team) throw new BadRequestException('Команда не найдена');

    let domain: Domain | null = null;
    let meta: Record<string, any> = {};

    // ===========================================================
    // 1) ПОКУПКА НОВОГО ДОМЕНА
    // ===========================================================
    if (dto.domainType === 'buy') {
      if (!dto.domainName) throw new BadRequestException('Не указано имя домена');

      const purchaseRes = await this.purchaseDomain(teamId, {
        domainName: dto.domainName,
        years: 1
      });

      domain = await this.repo.findOne({ where: { name: dto.domainName } });

      if (!domain) throw new BadRequestException('Купленный домен не найден');

      domain.status = 'attached';
      domain.team = team;
      domain.flowId = flow.id;
      domain.expiresAt = purchaseRes.data?.expiresAt ?? null;

      await this.repo.save(domain);

      meta = {
        purchase: {
          expiresAt: domain.expiresAt,
          priceUsd: purchaseRes.data?.priceUsd
        }
      };

      return { success: true, domain, meta };
    }

    // ===========================================================
    // 2) СИСТЕМНЫЙ ДОМЕН (ПОКУПКА КАК ИМПОРТНОГО)
    // ===========================================================
    if (dto.domainType === 'system') {
      if (!dto.domainId) throw new BadRequestException('Не выбран системный домен');

      const sysDomain = await this.repo.findOne({
        where: { id: dto.domainId, provider: 'system', status: 'available' }
      });

      if (!sysDomain) throw new BadRequestException('Системный домен недоступен');
      if (!sysDomain.priceUsd) throw new BadRequestException('У системного домена не указана цена');

      const price = Number(sysDomain.priceUsd);

      if (team.balance.amount < price) {
        throw new BadRequestException('Недостаточно средств');
      }

      // списываем деньги
      team.balance.amount -= price;
      await this.repo.manager.save(team.balance); // <-- FIX HERE (важно!)

      // создаём зону Cloudflare
      const zone = await this.cloudflare.createZone(sysDomain.name);
      const nsRecords = zone.name_servers || [];

      await this.namecheap.setCustomNameservers(sysDomain.name, nsRecords);

      await this.cloudflare.upsertRecord(zone.id, 'A', sysDomain.name, process.env.CF_SERVER_IP!);

      await this.cloudflare.upsertRecord(zone.id, 'CNAME', `www.${sysDomain.name}`, sysDomain.name);

      // Обновляем домен
      sysDomain.status = 'attached';
      sysDomain.team = team;
      sysDomain.flowId = flow.id;
      sysDomain.nsRecords = nsRecords;

      await this.repo.save(sysDomain);

      // Логируем транзакцию
      await this.repo.manager.save(
        this.repo.manager.create(FinanceTransaction, {
          team: { id: teamId },
          amount: -price,
          type: 'domain_purchase',
          description: `Покупка системного домена ${sysDomain.name}`
        })
      );

      domain = sysDomain;

      meta = {
        cloudflare: {
          zoneId: zone.id,
          nameServers: nsRecords
        },
        payment: {
          priceUsd: price
        }
      };

      return { success: true, domain, meta };
    }

    // ===========================================================
    // 3) КУПЛЕННЫЙ ДОМЕН КОМАНДЫ
    // ===========================================================
    if (dto.domainType === 'user') {
      if (!dto.domainId) throw new BadRequestException('Не выбран купленный домен');

      const userDomain = await this.repo.findOne({
        where: {
          id: dto.domainId,
          provider: 'namecheap',
          team: { id: teamId },
          status: 'purchased'
        }
      });

      if (!userDomain) throw new BadRequestException('Купленный домен недоступен');

      userDomain.status = 'attached';
      userDomain.flowId = flow.id;

      await this.repo.save(userDomain);
      domain = userDomain;

      return { success: true, domain };
    }

    // ===========================================================
    // 4) СОБСТВЕННЫЙ ДОМЕН (CUSTOM + CLOUDFLARE ACCOUNT)
    // ===========================================================
    if (dto.domainType === 'custom') {
      if (!dto.domainName) throw new BadRequestException('Не указано имя домена');

      if (!dto.cloudflareAccountId) throw new BadRequestException('Не выбран Cloudflare аккаунт');

      const account = await this.cloudflareAccountRepo.findOne({
        where: { id: dto.cloudflareAccountId, team: { id: teamId } }
      });

      if (!account) throw new BadRequestException('Cloudflare аккаунт не найден');

      const zone = await this.cloudflare.createZone(
        dto.domainName,
        account.apiToken,
        account.accountId
      );

      domain = this.repo.create({
        name: dto.domainName,
        provider: 'custom',
        status: 'attached',
        team,
        flowId: flow.id,
        expiresAt: dto.expiresAt ?? null,
        nsRecords: zone.name_servers
      });

      await this.repo.save(domain);

      meta = {
        cloudflare: {
          zoneId: zone.id,
          nameServers: zone.name_servers
        }
      };

      return { domain, meta };
    }

    throw new BadRequestException('Неверный тип домена');
  }

  async addCloudflareAccount(teamId: string, dto: CreateCloudflareAccountDto) {
    const team = await this.teamRepo.findOneBy({ id: teamId });
    if (!team) throw new BadRequestException('Команда не найдена');

    const res = await axios.get('https://api.cloudflare.com/client/v4/accounts', {
      headers: {
        Authorization: `Bearer ${dto.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.data.success || !res.data.result?.length) {
      throw new BadRequestException('Неверный Cloudflare API токен');
    }

    const accountId = res.data.result[0].id;

    const existing = await this.cloudflareAccountRepo.findOne({
      where: { team: { id: teamId }, email: dto.email }
    });

    if (existing) {
      throw new BadRequestException('Cloudflare аккаунт с таким email уже существует');
    }

    const acc = this.cloudflareAccountRepo.create({
      name: dto.name,
      email: dto.email,
      apiToken: dto.apiToken,
      accountId,
      team
    });

    return this.cloudflareAccountRepo.save(acc);
  }

  async getCloudflareAccounts(teamId: string) {
    return this.cloudflareAccountRepo.find({
      where: { team: { id: teamId } },
      order: { createdAt: 'DESC' }
    });
  }

  async getAll(teamId: string) {
    if (!teamId) throw new NotFoundException('Команда не найдена');
    return this.repo.find({ where: { team: { id: teamId } }, order: { createdAt: 'DESC' } });
  }

  async getInfo(name: string) {
    return this.namecheap.getInfo(name);
  }
}
