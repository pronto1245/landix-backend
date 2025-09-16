import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CloudflareService } from './cloudflare.service';
import { BuyDomainDto } from './dto/buy-domain.dto';
import { CustomDomainDto } from './dto/custom-domain.dto';
import { SystemDomainDto } from './dto/system-domain.dto';
import { Domain } from './entities/domain.entity';
import { RegRuService } from './reg-ru.service';

@Injectable()
export class DomainsService {
  constructor(
    @InjectRepository(Domain)
    private readonly domainRepo: Repository<Domain>,
    private readonly regRuService: RegRuService,
    private readonly cloudflare: CloudflareService
  ) {}

  async checkAvailability(domain: string) {
    const existing = await this.domainRepo.findOne({
      where: { name: domain.toLowerCase() }
    });

    if (existing) return false;

    return await this.regRuService.checkAvailability(domain);
  }

  async buyAndAttachToFlow(dto: BuyDomainDto): Promise<Domain> {
    const domain = dto.domain.toLowerCase();

    const available = await this.checkAvailability(domain);
    if (!available) {
      throw new ConflictException('Домен уже занят или не доступен');
    }

    const result = await this.regRuService.registerDomain(domain);
    if (!result.success) {
      throw new BadRequestException('Ошибка при покупке домена через REG.RU');
    }

    const entity = this.domainRepo.create({
      name: domain,
      type: 'purchased',
      status: 'active',
      expiresAt: result.expiresAt
    });

    return await this.domainRepo.save(entity);
  }

  async attachSystemDomain(dto: SystemDomainDto): Promise<Domain> {
    console.log(dto);
    const systemDomain = await this.domainRepo.findOne({
      where: { type: 'system', status: 'active' }
    });

    if (!systemDomain) {
      throw new NotFoundException('Нет доступных системных доменов');
    }

    return systemDomain;
  }

  async attachCustomDomain(dto: CustomDomainDto): Promise<Domain> {
    const customDomain = dto.domain.toLowerCase();
    const exists = await this.domainRepo.findOne({
      where: { name: customDomain }
    });

    if (exists) {
      throw new ConflictException('Такой домен уже добавлен');
    }

    const domain = this.domainRepo.create({
      name: customDomain,
      type: 'custom',
      status: 'active'
    });

    return await this.domainRepo.save(domain);
  }

  async connectCloudflare(domain: Domain): Promise<Domain> {
    const ip = process.env.CF_SERVER_IP;
    if (!ip) {
      throw new NotFoundException('CF_SERVER_IP не найден в .env');
    }

    const zoneId = await this.cloudflare.createZone(domain.name);
    const recordOk = await this.cloudflare.addARecord(zoneId, ip);

    if (!recordOk) {
      throw new BadRequestException('Не удалось добавить A-запись в Cloudflare');
    }

    domain.cloudflareZoneId = zoneId;
    return await this.domainRepo.save(domain);
  }
}
