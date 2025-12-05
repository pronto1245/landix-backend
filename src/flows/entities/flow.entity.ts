import { Domain } from 'src/domains/entities/domain.entity';
import { Landing } from 'src/landing/entities/landing.entity';
import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('flows')
export class Flow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Domain, { nullable: true, onDelete: 'SET NULL', eager: true })
  domain: Domain | null;

  @ManyToOne(() => Team, (team) => team.flows, { nullable: false })
  team: Team;

  @ManyToOne(() => Landing, { nullable: true, onDelete: 'SET NULL', eager: true })
  landing: Landing | null;

  @Column({
    type: 'enum',
    enum: ['active', 'archived', 'domain_check'],
    default: 'domain_check'
  })
  status: 'active' | 'archived' | 'domain_check';

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL', nullable: true })
  creator: User | null;

  @Column({ type: 'jsonb', default: null, nullable: true })
  cloak: {
    enabled: boolean;
    allowedCountry?: string;
    blockBots?: boolean;
    whitePageHtml?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  splitTest: {
    enabled: boolean;
    variants: { landingId: string; weight: number }[];
  };

  @CreateDateColumn()
  createdAt: Date;
}
