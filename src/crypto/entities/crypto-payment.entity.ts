import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('crypto_payments')
export class CryptoPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => Team, { nullable: true, eager: true })
  team: Team;

  @Column()
  currency: string;

  @Column('decimal', { precision: 18, scale: 8 })
  amountUsd: number;

  @Column()
  orderId: string;

  @Column({ nullable: true })
  invoiceUrl?: string;

  @Column({ nullable: true })
  invoiceId?: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: ['waiting', 'confirmed', 'cancelled'],
    default: 'waiting'
  })
  status: 'cancelled' | 'confirmed' | 'waiting';

  @CreateDateColumn()
  createdAt: Date;
}
