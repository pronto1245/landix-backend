import { Exclude } from 'class-transformer';
import { TeamMember } from 'src/team/entities/team-member.entity';
import { Team } from 'src/team/entities/team.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Exclude()
  @Column({ nullable: true })
  googleId: string;

  @Exclude()
  @Column({ nullable: true, type: 'text' })
  refreshToken: string | null;

  @OneToMany(() => TeamMember, (member) => member.user)
  teamMemberships: TeamMember[];

  @ManyToOne(() => Team, { nullable: true })
  activeTeam?: Team;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
