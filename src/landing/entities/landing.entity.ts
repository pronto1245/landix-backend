import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
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

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'creatorId' })
  @Index()
  creator: User;

  @ManyToOne(() => Team, { nullable: false })
  @JoinColumn({ name: 'teamId' })
  @Index()
  team: Team;

  @Column({ type: 'uuid', nullable: true })
  memberId: string | null;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  buttonDefault: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  buttonNext: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  buttonWin: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pwaName: string | null;

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

  @Column({ type: 'varchar', length: 500, nullable: true })
  redirect: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
