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
  name: string;

  @Column({ type: 'enum', enum: ['namecheap', 'custom', 'system'], default: 'namecheap' })
  provider: 'custom' | 'namecheap' | 'system';

  @Column({
    type: 'enum',
    enum: ['available', 'purchased', 'attached', 'failed', 'pending'],
    default: 'available'
  })
  status: 'attached' | 'available' | 'failed' | 'pending' | 'purchased';

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  priceUsd: number | null;

  @ManyToOne(() => Team, (team) => team.domains, { nullable: true })
  team: Team | null;

  @Column({ type: 'uuid', nullable: true })
  flowId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  nsRecords: string[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
