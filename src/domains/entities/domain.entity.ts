import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('domains')
export class Domain {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'system' })
  type: 'custom' | 'purchased' | 'system';

  @Column({ default: 'active' })
  status: 'active' | 'expired' | 'pending';

  @Column({ nullable: true })
  cloudflareZoneId?: string;

  @ManyToOne(() => User, { nullable: true })
  owner?: User;

  @Column({ nullable: true })
  purchasePrice?: number;

  @Column({ nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
