import { Domain } from 'src/domains/entities/domain.entity';
import { FacebookPixel } from 'src/facebook/entities/facebook-pixel.entity';
import { Landing } from 'src/landing/entities/landing.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('flows')
export class Flow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Domain)
  domain: Domain;

  @ManyToOne(() => Landing)
  landing: Landing;

  @ManyToMany(() => FacebookPixel)
  @JoinTable()
  facebookPixels: FacebookPixel[];

  @Column({ default: false })
  cloakingEnabled: boolean;

  @Column('jsonb', { nullable: true })
  cloakSettings: Record<string, any>;

  @Column({ nullable: true })
  abTestGroupId: string;

  @Column({ default: 'ru' })
  lang: string;

  @Column({ default: 'Roboto' })
  font: string;

  @Column({ nullable: true })
  redirectUrl?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('jsonb', { nullable: true })
  macros?: Record<string, string>;

  @Column({ nullable: true })
  clientId?: string;

  @Column({ nullable: true })
  macrosType?: string;

  @Column('text', { array: true, nullable: true })
  facebookApiTokens?: string[];

  @Column('text', { array: true, nullable: true })
  trafficbackUrls?: string[];

  @Column('jsonb', { nullable: true })
  trafficbackRules?: Record<string, any>;

  @Column({ nullable: true })
  prelanderUrl?: string;

  @Column({ nullable: true })
  finalLandingUrl?: string;

  @Column({ type: 'int', default: 0 })
  switchDelay: number;

  @Column({ default: '400' })
  fontWeight: string;

  @CreateDateColumn()
  createdAt: Date;
}
