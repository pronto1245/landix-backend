import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckDomainDto } from './dto/check-domain.dto';
import { PurchaseDomainDto } from './dto/purchase-domain.dto';
import { Domain } from './entities/domain.entity';
import { NamecheapClient } from './namecheap/namecheap.client';

@Injectable()
export class DomainsService {
  constructor(
    @InjectRepository(Domain)
    private readonly repo: Repository<Domain>,
    private readonly namecheap: NamecheapClient
  ) {}

  async checkDomain(dto: CheckDomainDto) {
    const result = await this.namecheap.checkDomain(dto.name);

    if (result.error) throw new BadRequestException(result.error);
    return result;
  }

  async purchaseDomain(teamId: string, dto: PurchaseDomainDto) {
    const existing = await this.repo.findOne({ where: { name: dto.name } });

    if (existing) throw new BadRequestException('Домен уже существует в системе');

    const result = await this.namecheap.checkDomain(dto.name);

    if (!result.available) throw new BadRequestException('Домен занят');

    const domain = this.repo.create({
      name: dto.name,
      zone: dto.name.split('.').pop(),
      status: 'purchased',
      provider: 'namecheap',
      priceUsd: 2.99,
      team: { id: teamId } as any
    });

    await this.repo.save(domain);
    return domain;
  }

  async getAll(teamId: string) {
    return this.repo.find({
      where: { team: { id: teamId } },
      order: { createdAt: 'DESC' }
    });
  }

  async getInfo(name: string) {
    return this.namecheap.getInfo(name);
  }
}
