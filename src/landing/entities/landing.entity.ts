import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
// src/landings/entities/landing.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('landings')
export class Landing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 🔹 Кто создал лендинг */
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'creatorId' })
  @Index()
  creator: User;

  /** 🔹 Команда-владелец */
  @ManyToOne(() => Team, { nullable: false })
  @JoinColumn({ name: 'teamId' })
  @Index()
  team: Team;

  /** 🔹 Основные поля */
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50 })
  gameType: string;

  @Column({ type: 'varchar', length: 120 })
  template: string;

  @Column({ type: 'varchar', length: 200 })
  view: string;

  @Column({ type: 'varchar', length: 8, default: 'en' })
  locale: string;

  @Column({ type: 'int', default: 1 })
  spins: number;

  /** 🔹 JSON-поля */
  @Column({ type: 'jsonb', default: {} })
  sectors: any;

  @Column({ type: 'jsonb', default: {} })
  effects: any;

  @Column({ type: 'jsonb', default: {} })
  bonuses: any;

  @Column({ type: 'jsonb', default: {} })
  freeBet: any;

  @Column({ type: 'jsonb', default: {} })
  font: any;

  /** 🔹 Прочее */
  @Column({ type: 'varchar', length: 500, nullable: true })
  redirect: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
