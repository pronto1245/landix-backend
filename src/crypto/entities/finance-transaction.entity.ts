import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('finance_transactions')
export class FinanceTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => Team, { nullable: true, eager: true })
  team: Team;

  @Column()
  type: 'button_click' | 'pwa_install';

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({ default: 'success' })
  status: 'declined' | 'success';

  @CreateDateColumn()
  createdAt: Date;
}
