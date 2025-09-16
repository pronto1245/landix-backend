import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('balance_transactions')
export class BalanceTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  type: 'deposit' | 'withdrawal';

  @Column('decimal', { precision: 18, scale: 8 })
  amountUsd: number;

  @Column({ nullable: true })
  currency?: string;

  @Column({ nullable: true })
  txHash?: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;
}
