import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TeamRole } from '../types/team-role.enum';
import { Team } from './team.entity';

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team, (t) => t.members, { onDelete: 'CASCADE' })
  team: Team;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: TeamRole, default: TeamRole.FINANCE })
  role: TeamRole;

  @CreateDateColumn()
  joinedAt: Date;
}
