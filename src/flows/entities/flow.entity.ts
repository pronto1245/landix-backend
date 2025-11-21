import { Domain } from 'src/domains/entities/domain.entity';
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

  @Column({
    type: 'enum',
    enum: ['active', 'archived', 'domain_check'],
    default: 'domain_check'
  })
  status: 'active' | 'archived' | 'domain_check';

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL', nullable: true })
  creator: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
