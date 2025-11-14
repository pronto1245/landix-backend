import { CloudflareAccount } from 'src/domains/entities/cloudflare-account.entity';
import { Domain } from 'src/domains/entities/domain.entity';
import { Flow } from 'src/flows/entities/flow.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { TeamBalance } from './team-balance.entity';
import { TeamMember } from './team-member.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn()
  owner: User;

  @OneToMany(() => TeamMember, (m) => m.team)
  members: TeamMember[];

  @OneToOne(() => TeamBalance, (balance) => balance.team, { cascade: true })
  @JoinColumn()
  balance: TeamBalance;

  @OneToMany(() => Domain, (domain) => domain.team)
  domains: Domain[];

  @OneToMany(() => Flow, (flow) => flow.team)
  flows: Flow[];

  @OneToMany(() => CloudflareAccount, (account) => account.team)
  cloudflareAccounts: CloudflareAccount[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
