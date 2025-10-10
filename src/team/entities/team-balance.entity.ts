import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Team } from './team.entity';

@Entity('team_balances')
export class TeamBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Team, (team) => team.balance, { onDelete: 'CASCADE' })
  team: Team;

  @Column('decimal', { precision: 18, scale: 8, default: 0 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;
}
