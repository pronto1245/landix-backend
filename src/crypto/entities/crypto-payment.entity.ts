import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('crypto_payments')
export class CryptoPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  currency: string;

  @Column('decimal', { precision: 18, scale: 8 })
  amountUsd: number;

  @Column()
  orderId: string;

  @Column({ nullable: true })
  invoiceUrl?: string;

  @Column({ nullable: true })
  paymentId?: string;

  @Column({
    type: 'enum',
    enum: ['waiting', 'confirmed', 'cancelled'],
    default: 'waiting'
  })
  status: 'cancelled' | 'confirmed' | 'waiting';

  @CreateDateColumn()
  createdAt: Date;
}
