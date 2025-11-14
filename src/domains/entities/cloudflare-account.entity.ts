import { Team } from 'src/team/entities/team.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cloudflare_accounts')
export class CloudflareAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  apiToken: string;

  @Column()
  accountId: string;

  @ManyToOne(() => Team, (team) => team.cloudflareAccounts, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  team: Team;

  @CreateDateColumn()
  createdAt: Date;
}
