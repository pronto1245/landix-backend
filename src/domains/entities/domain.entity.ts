import { Team } from 'src/team/entities/team.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('domains')
export class Domain {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // example.fun

  @Column()
  zone: string; // fun

  @Column({
    type: 'enum',
    enum: ['available', 'purchased', 'attached', 'failed'],
    default: 'available'
  })
  status: 'available' | 'purchased' | 'attached' | 'failed';

  @Column({
    type: 'enum',
    enum: ['namecheap', 'custom'],
    default: 'namecheap'
  })
  provider: 'namecheap' | 'custom';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceUsd?: number;

  @Column({ nullable: true })
  expiresAt?: Date;

  @Column({ nullable: true })
  dnsType?: string;

  @Column({ nullable: true })
  dnsTarget?: string;

  @ManyToOne(() => Team, (team) => team.domains, { nullable: false })
  team: Team;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
